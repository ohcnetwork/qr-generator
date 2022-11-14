import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import Input from "./components/Input";
import Tabs from "./components/Tabs";

import html2canvas from "html2canvas";
import Range from "./components/Range";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const zip = new JSZip();

function saveAsHelper(uri, filename) {
  var link = document.createElement("a");
  if (typeof link.download === "string") {
    link.href = uri;
    link.download = filename;
    //Firefox requires the link to be in the body
    document.body.appendChild(link);
    //Simulate click
    link.click();
    //Remove the link when done
    document.body.removeChild(link);
  } else {
    window.open(uri);
  }
}

// eslint-disable-next-line no-unused-vars
const printAs = (filename) => {
  html2canvas(document.querySelector("#printarea")).then(function (canvas) {
    saveAsHelper(canvas.toDataURL(), filename + ".png");
  });
};
const zipAs = (filename) => {
  html2canvas(document.querySelector("#printarea")).then(function (canvas) {
    addToZip(canvas.toDataURL(), filename);
    // saveAsHelper(canvas.toDataURL(), filename + ".png");
  });
};

const addToZip = (dataURL, filename) => {
  zip.file(filename + ".png", dataURL.split("base64,")[1], { base64: true });
};

function App() {
  const [range, setRange] = useState(10);
  const [start, setStart] = useState(1001);
  const [baseURL, setBaseURL] = useState("");

  const [currentQR, setCurrentQR] = useState({
    mode: "preview",
    data: "1",
  });

  const baseUrlValue =
    baseURL.length > 0
      ? baseURL
      : "https://dashboard.coronasafe.network/assets?asset_id=";

  const onGenerate = (start) => {
    setCurrentQR({
      mode: "zipping",
      data: start,
    });
  };

  useEffect(() => {
    if (currentQR.mode === "zipping") {
      console.log("zipping", currentQR.data - start + 1, "of", range);
      zipAs(currentQR.data);
      if (currentQR.data - start < range - 1) {
        setCurrentQR({
          mode: "zipping",
          data: currentQR.data + 1,
        });
      } else {
        setCurrentQR({
          mode: "preview",
          data: start,
        });
        setTimeout(() => {
          zip.generateAsync({ type: "blob" }).then(function (content) {
            console.log(content);
            saveAs(content, "QR Codes.zip");
          });
        }, 2000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQR, range, start]);

  return (
    <div className="bg-gray-100 h-screen max-h-screen overflow-auto p-12 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6 flex flex-col items-center">
          <Tabs tabs={[{ name: "Template", href: "/", current: true }]} />

          {currentQR.mode === "preview" && (
            <>
              <h3 className="mt-4 text-lg font-medium leading-6 text-gray-900">
                Generate your QRs
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Select/Type your base URL & Select the range of QRs you want
                  to generate
                </p>
              </div>
              <div className="mt-5 w-full">
                <Input
                  value={baseURL}
                  label="Base URL"
                  placeholder={
                    "https://dashboard.coronasafe.network/assets?asset_id="
                  }
                  onChange={(e) => {
                    setBaseURL(e.target.value);
                  }}
                />

                <Range
                  min={1}
                  max={1000}
                  value={range}
                  onChange={setRange}
                  label={"How many QRs do you need to Generate?"}
                />

                <Range
                  min={1}
                  max={10000}
                  value={start}
                  onChange={setStart}
                  label={"Start from?"}
                />
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm"
                  onClick={(_) => onGenerate(start)}
                >
                  Generate
                </button>
              </div>
            </>
          )}
          {currentQR.mode === "zipping" && (
            <>
              <div class="mt-5 font-medium leading-6 text-lg text-gray-900">
                Generating {currentQR.data - start + 1} of {range}
              </div>
              <div class="my-4 text-sm text-gray-500">
                Bear with us as we generate your QRs :)
              </div>
              <svg
                class="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </>
          )}

          <div className="mt-5">
            <span className="text-gray-500 text-2xl">Preview</span>
          </div>
          <div id="printarea" className="p-6 flex flex-col items-center">
            <QRCode value={`${baseUrlValue}${currentQR.data}`} />
            <span className="text-gray-500 mt-2">{currentQR.data}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
