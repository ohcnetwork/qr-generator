import { useEffect, useState } from "react"

import { toPng } from "html-to-image"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import { QRCodeSVG } from "qrcode.react"

import Input from "./components/Input.js"
import Tabs from "./components/Tabs.js"
import Range from "./components/Range.js"

const zip = new JSZip()

function saveAsHelper(uri: string, filename: string) {
  var link = document.createElement("a")
  if (typeof link.download === "string") {
    link.href = uri
    link.download = filename
    //Firefox requires the link to be in the body
    document.body.appendChild(link)
    //Simulate click
    link.click()
    //Remove the link when done
    document.body.removeChild(link)
  } else {
    window.open(uri)
  }
}

const printAs = (filename: string) => {
  const printArea = document.querySelector("#printarea") as HTMLElement
  if (printArea) {
    toPng(printArea, { cacheBust: true }).then((dataUrl) => {
      saveAsHelper(dataUrl, filename + ".png")
    })
  }
}
const zipAs = (filename: string) => {
  const printArea = document.querySelector("#printarea") as HTMLElement
  if (printArea) {
    toPng(printArea, { cacheBust: true }).then((dataUrl) => {
      addToZip(dataUrl, filename)
    })
  }
}

const addToZip = (dataURL: string, filename: string) => {
  zip.file(filename + ".png", dataURL.split("base64,")[1], { base64: true })
}

const defaultBaseUrl = "https://dashboard.coronasafe.network/assets?asset_id="

function App() {
  const [mode, setMode] = useState("preview")
  const [range, setRange] = useState(10)
  const [start, setStart] = useState(1001)
  const [baseURL, setBaseURL] = useState(defaultBaseUrl)
  const [currentQRId, setCurrentQR] = useState(start)

  const onGenerate = (start: number) => {
    setMode("zipping")
    setCurrentQR(start)
  }

  useEffect(() => {
    if (mode === "zipping") {
      console.log("zipping", currentQRId - start + 1, "of", range)
      zipAs(currentQRId.toString())
      if (currentQRId - start < range - 1) {
        setCurrentQR(currentQRId + 1)
      } else {
        setMode("preview")
        setCurrentQR(start)
        setTimeout(() => {
          zip.generateAsync({ type: "blob" }).then(function (content) {
            console.log(content)
            saveAs(content, `QR_Codes_${start}-${start + range}.zip`)
          })
        }, 2000)
      }
    } else if (mode === "preview") {
      setCurrentQR(start)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQRId, range, start, mode])

  return (
    <div className="bg-gray-100 h-screen max-h-screen overflow-auto p-12 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6 flex flex-col items-center">
          <Tabs tabs={[{ name: "Template", href: "/", current: true }]} />

          {mode === "preview" && (
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
                  placeholder={defaultBaseUrl}
                  onChange={(e) => {
                    setBaseURL(e.target.value)
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
          {mode === "zipping" && (
            <>
              <div className="mt-5 font-medium leading-6 text-lg text-gray-900">
                Generating {currentQRId - start + 1} of {range}
              </div>
              <div className="my-4 text-sm text-gray-500">
                Bear with us as we generate your QRs :)
              </div>
              <div className="w-full h-6 bg-gray-200 rounded-full">
                <div
                  className="h-6 bg-blue-600 rounded-full"
                  style={{
                    width: `${((currentQRId - start + 1) / range) * 100}%`,
                  }}
                ></div>
              </div>
            </>
          )}

          <div className="mt-5">
            <span className="text-gray-500 text-2xl">Preview</span>
          </div>
          <div
            id="printarea"
            className="p-6 flex flex-col items-center bg-white"
          >
            <QRCodeSVG
              size={256}
              value={`${baseURL || defaultBaseUrl}${currentQRId}`}
            />
            <span className="text-gray-500 mt-2">{currentQRId}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
