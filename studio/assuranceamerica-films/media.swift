// Video facts and a poster frame, using only macOS AVFoundation (no ffmpeg needed).
// Usage: swift media.swift <video> [<poster.jpg> <seconds> <maxWidth>]
// Prints one JSON line: {"duration":…, "width":…, "height":…, "codec":"avc1", "mbps":…, "audio":1}
import AVFoundation
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
let asset = AVURLAsset(url: URL(fileURLWithPath: args[1]))
let done = DispatchSemaphore(value: 0)
Task {
  defer { done.signal() }
  do {
    var out: [String: Any] = ["duration": try await asset.load(.duration).seconds]
    if let t = try await asset.loadTracks(withMediaType: .video).first {
      let size = try await t.load(.naturalSize)
      let r = CGRect(origin: .zero, size: size).applying(try await t.load(.preferredTransform))
      out["width"] = Int(abs(r.width)); out["height"] = Int(abs(r.height))
      out["mbps"] = Double(try await t.load(.estimatedDataRate)) / 1e6
      if let f = try await t.load(.formatDescriptions).first {
        let c = CMFormatDescriptionGetMediaSubType(f)
        out["codec"] = String(bytes: [24, 16, 8, 0].map { UInt8((c >> $0) & 255) }, encoding: .ascii) ?? "?"
      }
    }
    out["audio"] = try await asset.loadTracks(withMediaType: .audio).count
    if args.count >= 5 {
      let gen = AVAssetImageGenerator(asset: asset)
      gen.appliesPreferredTrackTransform = true
      gen.requestedTimeToleranceBefore = .zero
      gen.requestedTimeToleranceAfter = .zero
      let w = Double(args[4])!
      gen.maximumSize = CGSize(width: w, height: w)
      let (img, _) = try await gen.image(at: CMTime(seconds: Double(args[3])!, preferredTimescale: 600))
      let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: args[2]) as CFURL, UTType.jpeg.identifier as CFString, 1, nil)!
      CGImageDestinationAddImage(dest, img, [kCGImageDestinationLossyCompressionQuality: 0.8] as CFDictionary)
      if !CGImageDestinationFinalize(dest) { throw NSError(domain: "poster", code: 1) }
    }
    print(String(data: try JSONSerialization.data(withJSONObject: out, options: [.sortedKeys]), encoding: .utf8)!)
  } catch {
    FileHandle.standardError.write("media.swift: \(error)\n".data(using: .utf8)!)
    exit(1)
  }
}
done.wait()
