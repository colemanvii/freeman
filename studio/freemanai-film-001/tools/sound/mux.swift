// Writes the film: H.264 High (BT.709) from a folder of 30 fps JPEG frames, plus AAC-LC stereo from a WAV.
//   swiftc -O -swift-version 5 mux.swift -o mux && ./mux <frames-dir> <audio.wav> <out.mp4> [videoBitrate]
import AVFoundation
import CoreGraphics
import ImageIO

let args = CommandLine.arguments
guard args.count >= 4 else { print("usage: mux <frames-dir> <audio.wav> <out.mp4> [bitrate]"); exit(2) }
let framesDir = URL(fileURLWithPath: args[1]), wavURL = URL(fileURLWithPath: args[2]), outURL = URL(fileURLWithPath: args[3])
let bitrate = args.count > 4 ? Int(args[4])! : 6_500_000
let W = 1920, H = 1080, fps: Int32 = 30

let frames = try FileManager.default.contentsOfDirectory(atPath: framesDir.path).filter { $0.hasSuffix(".jpg") }.sorted()
try? FileManager.default.removeItem(at: outURL)
let writer = try AVAssetWriter(outputURL: outURL, fileType: .mp4)
writer.shouldOptimizeForNetworkUse = true

let video = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: W, AVVideoHeightKey: H,
  AVVideoColorPropertiesKey: [AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2, AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2, AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2],
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: bitrate, AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel, AVVideoMaxKeyFrameIntervalKey: 60, AVVideoExpectedSourceFrameRateKey: fps, AVVideoH264EntropyModeKey: AVVideoH264EntropyModeCABAC]
])
video.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: video, sourcePixelBufferAttributes: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA, kCVPixelBufferWidthKey as String: W, kCVPixelBufferHeightKey as String: H])

let audio = AVAssetWriterInput(mediaType: .audio, outputSettings: [AVFormatIDKey: kAudioFormatMPEG4AAC, AVSampleRateKey: 48000, AVNumberOfChannelsKey: 2, AVEncoderBitRateKey: 256_000])
audio.expectsMediaDataInRealTime = false
writer.add(video); writer.add(audio)

let asset = AVURLAsset(url: wavURL)
let track = asset.tracks(withMediaType: .audio)[0]
let reader = try AVAssetReader(asset: asset)
let rout = AVAssetReaderTrackOutput(track: track, outputSettings: [AVFormatIDKey: kAudioFormatLinearPCM, AVLinearPCMBitDepthKey: 32, AVLinearPCMIsFloatKey: true, AVLinearPCMIsNonInterleaved: false, AVLinearPCMIsBigEndianKey: false])
reader.add(rout)
reader.startReading()

writer.startWriting()
writer.startSession(atSourceTime: .zero)
let group = DispatchGroup()

group.enter()
var i = 0
let vq = DispatchQueue(label: "video")
video.requestMediaDataWhenReady(on: vq) {
  while video.isReadyForMoreMediaData {
    if i >= frames.count { video.markAsFinished(); group.leave(); return }
    let url = framesDir.appendingPathComponent(frames[i])
    guard let src = CGImageSourceCreateWithURL(url as CFURL, nil), let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else { fatalError("bad frame \(url.path)") }
    var pb: CVPixelBuffer?
    CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pb)
    CVPixelBufferLockBaseAddress(pb!, [])
    let ctx = CGContext(data: CVPixelBufferGetBaseAddress(pb!), width: W, height: H, bitsPerComponent: 8, bytesPerRow: CVPixelBufferGetBytesPerRow(pb!), space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)!
    ctx.interpolationQuality = .high
    ctx.draw(img, in: CGRect(x: 0, y: 0, width: W, height: H))
    CVPixelBufferUnlockBaseAddress(pb!, [])
    adaptor.append(pb!, withPresentationTime: CMTime(value: CMTimeValue(i), timescale: fps))
    i += 1
  }
}

group.enter()
let aq = DispatchQueue(label: "audio")
audio.requestMediaDataWhenReady(on: aq) {
  while audio.isReadyForMoreMediaData {
    if let sb = rout.copyNextSampleBuffer() { audio.append(sb) } else { audio.markAsFinished(); group.leave(); return }
  }
}

group.wait()
let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()
if writer.status != .completed { print("failed: \(String(describing: writer.error))"); exit(1) }
print("wrote \(outURL.path): \(frames.count) frames")
