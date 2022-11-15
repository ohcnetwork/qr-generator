import { useEffect, useState, useRef } from "react"

import { toPng } from "html-to-image"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import { QRCodeSVG } from "qrcode.react"

import Input from "./components/Input.js"
import Tabs from "./components/Tabs.js"
import Range from "./components/Range.js"

const zip = new JSZip()
const defaultBaseUrl = "https://dashboard.coronasafe.network/assets?asset_id="

function App() {
  const [mode, setMode] = useState("preview")
  const [qrCodesCount, setQrCodesCount] = useState(10)
  const [startingQrId, setStartingQrId] = useState(1001)
  const [currentQrId, setCurrentQrId] = useState(startingQrId)
  const [baseURL, setBaseURL] = useState(defaultBaseUrl)
  const printAreaRef = useRef<HTMLDivElement>(null)

  const addToZip = (filename: string, callback: () => void) => {
    if (printAreaRef.current) {
      toPng(printAreaRef.current, { cacheBust: true }).then((dataUrl) => {
        zip.file(filename + ".png", dataUrl.split("base64,")[1], {
          base64: true,
        })
        callback()
      })
    }
  }

  useEffect(() => {
    if (mode === "zipping") {
      console.log("zipping", currentQrId - startingQrId + 1, "of", qrCodesCount)
      if (currentQrId - startingQrId < qrCodesCount - 1) {
        addToZip(currentQrId.toString(), () => {
          setCurrentQrId(currentQrId + 1)
        })
      } else {
        addToZip(currentQrId.toString(), () => {
          zip.generateAsync({ type: "blob" }).then(function (content) {
            console.log(content)
            saveAs(
              content,
              `QR_Codes-${startingQrId}...${
                startingQrId + qrCodesCount - 1
              }.zip`
              )
            })
          console.timeEnd("zipping took")
          setMode("preview")
        })
      }
    } else if (mode === "preview") {
      setCurrentQrId(startingQrId)
    }
  }, [currentQrId, startingQrId, mode])

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
                  value={qrCodesCount}
                  onChange={setQrCodesCount}
                  label={"How many QRs do you need to Generate?"}
                />

                <Range
                  min={1}
                  max={10000}
                  value={startingQrId}
                  onChange={setStartingQrId}
                  label={"Start from?"}
                />
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm"
                  onClick={() => {
                    console.time("zipping took")
                    setMode("zipping")
                  }}
                >
                  Generate
                </button>
              </div>
            </>
          )}
          {mode === "zipping" && (
            <>
              <div className="mt-5 font-medium leading-6 text-lg text-gray-900">
                Generating {currentQrId - startingQrId + 1} of {qrCodesCount}
              </div>
              <div className="my-4 text-sm text-gray-500">
                Bear with us as we generate your QRs :)
              </div>
              <div className="w-full h-6 bg-gray-200 rounded-full">
                <div
                  className="h-6 bg-blue-600 rounded-full"
                  style={{
                    width: `${
                      ((currentQrId - startingQrId + 1) / qrCodesCount) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </>
          )}

          <div className="mt-5">
            <span className="text-gray-500 text-2xl">Preview</span>
          </div>
          <div
            ref={printAreaRef}
            className="p-6 flex flex-col items-center bg-white"
          >
            <QRCodeSVG
              size={256}
              value={`${baseURL || defaultBaseUrl}${currentQrId}`}
            />
            <span className="text-gray-500 mt-2">{currentQrId}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
