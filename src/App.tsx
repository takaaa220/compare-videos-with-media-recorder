import {
  ChangeEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

let stream: MediaStream | undefined;
let recorder: MediaRecorder | undefined;
let context: CanvasRenderingContext2D | undefined;

function App() {
  const [videoFile1, setVideo1] = useState<string>();
  const [videoFile2, setVideo2] = useState<string>();
  const [downloadFile, setDownloadFile] = useState<string>();

  const canvas = useRef<HTMLCanvasElement>(null);
  const video1 = useRef<HTMLVideoElement>(null);
  const video2 = useRef<HTMLVideoElement>(null);

  const status = useMemo(() => {
    if (!videoFile1 || !videoFile2) {
      return "waiting";
    }

    return "ready";
  }, [videoFile1, videoFile2]);

  const onChangeVideo1: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files?.[0]) {
      setVideo1(URL.createObjectURL(e.target.files[0]));

      setTimeout(() => {
        if (video1.current)
          context?.drawImage(
            video1.current,
            0,
            0,
            video1.current.width,
            video1.current.height
          );
      });
    }
  };

  const onChangeVideo2: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files?.[0]) {
      setVideo2(URL.createObjectURL(e.target.files[0]));

      setTimeout(() => {
        if (video1.current && video2.current)
          context?.drawImage(
            video2.current,
            video1.current.width,
            0,
            video2.current.width,
            video2.current.height
          );
      }, 100);
    }
  };

  const onClickStart = () => {
    if (!video1.current || !video2.current || !context || !recorder) return;

    video1.current.play();
    video2.current.play();

    setInterval(() => {
      if (!video1.current || !video2.current || !context) return;

      context?.drawImage(
        video1.current,
        0,
        0,
        video1.current.width,
        video1.current.height
      );
      context?.drawImage(
        video2.current,
        video1.current.width,
        0,
        video2.current.width,
        video2.current.height
      );
    }, 1000 / 30);

    recorder.start();
  };

  const onClickEnd = () => {
    recorder?.stop();

    video1.current?.pause();
    video2.current?.pause();
  };

  useEffect(() => {
    if (!canvas.current) return;

    const ctx = canvas.current.getContext("2d");
    if (!ctx) return;

    context = ctx;
    stream = canvas.current.captureStream(30);
    recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
    });

    recorder.addEventListener("dataavailable", (e) => {
      setDownloadFile(
        window.URL.createObjectURL(
          new Blob([e.data], { type: "video/webm;codecs=vp9" })
        )
      );
    });
  }, []);

  return (
    <div className="app">
      <div className="sm:container mx-auto px-4 py-8">
        <div className="out-of-view fixed top-[-100%]">
          {videoFile1 ? (
            <video
              controls
              width="480px"
              height="300px"
              ref={video1}
              src={videoFile1}
              className="object-fill"
            />
          ) : null}

          {videoFile2 ? (
            <video
              controls
              width="480px"
              height="300px"
              ref={video2}
              src={videoFile2}
              className="object-fill"
            />
          ) : null}
        </div>

        <div className="mb-4">
          <canvas
            id="preview"
            ref={canvas}
            width={480 * 2}
            height={300}
            className="border-2"
          />
        </div>

        <div className="mb-8">
          <label>
            <span>動画1</span>
            <input
              type="file"
              id="input1"
              accept="video/*"
              onChange={onChangeVideo1}
            />
          </label>
          <label>
            <span>動画2</span>
            <input
              type="file"
              id="input2"
              accept="video/*"
              onChange={onChangeVideo2}
            />
          </label>
        </div>

        <div className="flex gap-4">
          <button
            className="py-2 px-8 bg-white text-black rounded-lg"
            type="button"
            disabled={status !== "ready"}
            onClick={onClickStart}
          >
            再生
          </button>
          <button
            className="py-2 px-8 bg-white text-black rounded-lg"
            type="button"
            onClick={onClickEnd}
          >
            終了
          </button>
          {downloadFile ? (
            <a
              href={downloadFile}
              download="movie.webm"
              className="py-2 px-8 bg-white text-black rounded-lg"
            >
              ダウンロード
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;
