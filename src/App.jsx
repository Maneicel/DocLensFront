import { useState, useRef } from "react"
import ReactMarkdown from "react-markdown"
import "./App.css"

function App() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setResult("")
    if (f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f))
    } else {
      setPreview(null)
    }
  }

  const handleFileChange = (e) => handleFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handlePredict = async () => {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      setResult(data.result)
    } catch {
      setResult("오류가 발생했어요.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <p className="title">DOC<span>LENS</span></p>
        <p className="subtitle">이미지 · PDF · PPT 문서를 AI가 분석하고 정리합니다</p>
      </header>

      <main className="main">
        <div className="upload-section">
          <div
            className={`dropzone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
            onClick={() => inputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*,.pdf,.ppt,.pptx"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            {file ? (
              <div className="file-info">
                <div className="file-icon">
                  {file.type.startsWith("image/") ? "🖼" : file.name.endsWith(".pdf") ? "📄" : "📊"}
                </div>
                <div className="file-name">{file.name}</div>
                <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
              </div>
            ) : (
              <div className="dropzone-empty">
                <div className="drop-icon">↑</div>
                <div className="drop-text">파일을 드래그하거나 클릭하세요</div>
                <div className="drop-hint">이미지 · PDF · PPT 지원</div>
              </div>
            )}
          </div>

          {preview && (
            <div className="preview">
              <img src={preview} alt="미리보기" />
            </div>
          )}

          <button
            className={`analyze-btn ${loading ? "loading" : ""}`}
            onClick={handlePredict}
            disabled={!file || loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </span>
            ) : "분석하기"}
          </button>
        </div>

        {result && (
          <div className="result-section">
            <div className="result-label">분석 결과</div>
            <div className="result-content">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App