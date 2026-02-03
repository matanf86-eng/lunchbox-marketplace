const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

/**
 * Analyze a lunchbox image using Claude Vision
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<Array>} Array of detected food items
 */
export async function analyzeLunchbox(base64Image) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Missing Anthropic API key')
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image
              }
            },
            {
              type: 'text',
              text: `רשום רשימה של כל פריטי המזון שאתה רואה בתמונה הזו של קופסת אוכל. 
              
החזר את התשובה בפורמט JSON בלבד, ללא טקסט נוסף:
[
  {
    "name": "שם הפריט בעברית",
    "category": "קטגוריה (פירות/ירקות/חלבונים/פחמימות/חטיפים/משקאות)",
    "emoji": "אימוג'י מתאים"
  }
]`
            }
          ]
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content[0].text
    
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI')
    }
    
    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Error analyzing lunchbox:', error)
    throw error
  }
}

/**
 * Convert File to base64
 * @param {File} file
 * @returns {Promise<string>}
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
