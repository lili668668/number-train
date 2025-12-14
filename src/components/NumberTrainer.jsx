import { useState, useEffect, useRef } from 'react'
import './NumberTrainer.css'

function NumberTrainer() {
  const [numbers, setNumbers] = useState([])
  const [revealed, setRevealed] = useState([]) // 追蹤哪些數字已被顯示
  const clickTimerRef = useRef(null)

  // 生成符合規則的數字：超過百位數以上只有前兩位數字，其餘都是0
  const generateSpecialNumber = () => {
    // 最大值：9千9百9十9兆 = 9,999,999,999,999,999
    const maxDigits = 16

    // 隨機決定數字的位數 (2到16位)
    const digits = Math.floor(Math.random() * (maxDigits - 1)) + 2

    if (digits <= 2) {
      // 如果是1-2位數，可以是任意數字
      return Math.floor(Math.random() * 100)
    } else {
      // 超過百位數：前兩位是1-99，其餘位數都是0
      const firstTwoDigits = Math.floor(Math.random() * 99) + 1
      const zerosCount = digits - 2
      const number = firstTwoDigits * Math.pow(10, zerosCount)
      return number
    }
  }

  const generateNumbers = () => {
    const newNumbers = []
    for (let i = 0; i < 5; i++) {
      newNumbers.push(generateSpecialNumber())
    }
    setNumbers(newNumbers)
    // 重置所有數字為隱藏狀態
    setRevealed(new Array(5).fill(false))
  }

  // 初始化時生成數字
  useEffect(() => {
    generateNumbers()

    // 清理計時器
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current)
      }
    }
  }, [])

  // 格式化數字顯示（加入千分位逗號）
  const formatNumber = (num) => {
    return num.toLocaleString('en-US')
  }

  // 使用 TTS 念出數字（英文）
  const speakNumber = (num) => {
    // 取消當前正在朗讀的內容
    window.speechSynthesis.cancel()

    // 創建語音合成實例
    const utterance = new SpeechSynthesisUtterance(num.toLocaleString('en-US'))

    // 設定為英文
    utterance.lang = 'en-US'

    // 設定語速（可調整：0.1 到 10，預設 1）
    utterance.rate = 0.9

    // 設定音量（0 到 1，預設 1）
    utterance.volume = 1

    // 設定音調（0 到 2，預設 1）
    utterance.pitch = 1

    // 開始朗讀
    window.speechSynthesis.speak(utterance)
  }

  // 處理單擊事件：朗讀數字
  const handleClick = (num) => {
    // 清除之前的計時器
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
    }

    // 設定延遲來區分單擊和雙擊
    clickTimerRef.current = setTimeout(() => {
      speakNumber(num)
    }, 250) // 250ms 延遲
  }

  // 處理雙擊事件：顯示數字
  const handleDoubleClick = (index) => {
    // 清除單擊的計時器，避免雙擊時也觸發 TTS
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
    }

    // 更新該數字的顯示狀態
    setRevealed(prev => {
      const newRevealed = [...prev]
      newRevealed[index] = true
      return newRevealed
    })
  }

  return (
    <div className="container">
      <h1>數字訓練</h1>
      <p className="description">
        <small>單擊聽發音 | 雙擊顯示數字</small>
      </p>
      <ul className="number-list">
        {numbers.map((num, index) => (
          <li
            key={index}
            className={`number-item ${revealed[index] ? 'revealed' : 'hidden'}`}
            onClick={() => handleClick(num)}
            onDoubleClick={() => handleDoubleClick(index)}
          >
            {formatNumber(num)}
          </li>
        ))}
      </ul>
      <button onClick={generateNumbers} className="generate-btn">
        重新生成數字
      </button>
    </div>
  )
}

export default NumberTrainer
