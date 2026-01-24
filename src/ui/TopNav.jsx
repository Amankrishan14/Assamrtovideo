import '../ui/styles.css'

export default function TopNav() {
  const handleBack = () => {
    window.history.back()
  }

  return (
    <div className="top-nav">
      <button onClick={handleBack} aria-label="Go back">← Back</button>
      <div className="logo">WebAR</div>
    </div>
  )
}
