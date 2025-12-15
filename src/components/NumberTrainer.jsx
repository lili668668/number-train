import { useState, useEffect, useRef } from 'react'
import './NumberTrainer.css'
import nzh from 'nzh/cn'

function NumberTrainer() {
  const [numbers, setNumbers] = useState([])
  const [revealed, setRevealed] = useState([]) // 追蹤哪些數字已被顯示
  const [language, setLanguage] = useState('zh-TW') // 'zh-TW' 或 'en-US'
  const [ttsService, setTtsService] = useState('browser') // 'browser' 或 'google'
  const clickTimerRef = useRef(null)
  const audioRef = useRef(null)

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
    if (language === 'zh-TW') {
      return nzh.encodeS(num)
    }
    return num.toLocaleString('en-US')
  }

  // 使用瀏覽器內建 TTS 念出數字
  const speakWithBrowser = (num) => {
    // 取消當前正在朗讀的內容
    window.speechSynthesis.cancel()

    // 創建語音合成實例
    const utterance = new SpeechSynthesisUtterance(formatNumber(num))

    // 設定語言
    utterance.lang = language

    // 設定語速（可調整：0.1 到 10，預設 1）
    utterance.rate = 0.9

    // 設定音量（0 到 1，預設 1）
    utterance.volume = 1

    // 設定音調（0 到 2，預設 1）
    utterance.pitch = 1

    // 開始朗讀
    window.speechSynthesis.speak(utterance)
  }

  // 使用線上 TTS 服務念出數字
  const speakWithGoogle = async (num) => {
    // 停止當前正在播放的音訊
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    // 將語言代碼轉換為 TTS 服務支援的格式
    const voice = language === 'zh-TW' ? 'zf_xiaoxiao' : 'af_heart'

    try {
      // 使用新的 TTS API
      const response = await fetch('https://kokoro.ballfish.io/api/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'model',
          voice: voice,
          input: formatNumber(num),
          response_format: 'mp3',
          speed: 1
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // 將回應轉換為 blob
      const audioBlob = await response.blob()

      // 創建 blob URL 並播放音訊
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        // 播放結束後釋放 blob URL
        URL.revokeObjectURL(audioUrl)
      }

      audio.play().catch(error => {
        console.error('線上 TTS 播放失敗:', error)
        URL.revokeObjectURL(audioUrl)
      })
    } catch (error) {
      console.error('線上 TTS 請求失敗:', error)
    }
  }

  // 使用 TTS 念出數字（根據選擇的服務）
  const speakNumber = (num) => {
    if (ttsService === 'google') {
      speakWithGoogle(num)
    } else {
      speakWithBrowser(num)
    }
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

  // 切換語言
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh-TW' ? 'en-US' : 'zh-TW')
  }

  // 切換 TTS 服務
  const toggleTtsService = () => {
    setTtsService(prev => prev === 'browser' ? 'google' : 'browser')
  }

  return (
    <div className="container">
      <h1>數字訓練</h1>
      <div className="settings-panel">
        <div className="language-toggle">
          <span className="toggle-label">語言：</span>
          <button
            className={`toggle-btn ${language === 'zh-TW' ? 'active' : ''}`}
            onClick={toggleLanguage}
          >
            <span className={language === 'zh-TW' ? 'active' : ''}>中文</span>
            <span className={language === 'en-US' ? 'active' : ''}>English</span>
            <div className="toggle-slider" style={{
              transform: language === 'zh-TW' ? 'translateX(0)' : 'translateX(100%)'
            }}></div>
          </button>
        </div>
        <div className="language-toggle">
          <span className="toggle-label">引擎：</span>
          <button
            className={`toggle-btn ${ttsService === 'browser' ? 'active' : ''}`}
            onClick={toggleTtsService}
          >
            <span className={ttsService === 'browser' ? 'active' : ''}>瀏覽器</span>
            <span className={ttsService === 'google' ? 'active' : ''}>線上語音</span>
            <div className="toggle-slider" style={{
              transform: ttsService === 'browser' ? 'translateX(0)' : 'translateX(100%)'
            }}></div>
          </button>
        </div>
      </div>
      <p className="description">
        <small>單擊聽發音 | 雙擊顯示數字</small>
      </p>
      <p className="description">
        <small>瀏覽器的引擎語音速度較快，但可能會受限於裝置影響而有語言問題；線上語音的工具中文口音不是常見的腔調，英文則沒有問題，但產出速度較慢，仍在實驗中</small>
      </p>
      <ul className="number-list">
        {numbers.map((num, index) => (
          <li
            key={index}
            className={`number-item ${revealed[index] ? 'revealed' : 'hidden'}`}
            onClick={() => handleClick(num)}
            onDoubleClick={() => handleDoubleClick(index)}
          >
            {num.toLocaleString('en-US')}
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
