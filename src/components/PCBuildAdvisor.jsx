import { useState } from 'react'
import { DollarSign, Loader } from 'lucide-react'
import axios from 'axios'
import ComponentSelector from './ComponentSelector'
import BudgetInput from './BudgetInput'
import BuildRecommendation from './BuildRecommendation'

function PCBuildAdvisor() {
  const [budget, setBudget] = useState('')
  const [existingComponents, setExistingComponents] = useState({
    processor: false,
    motherboard: false,
    memory: false,
    gpu: false,
    ssd: false,
    hdd: false,
    psu: false,
    casing: false,
    cpuCooler: false
  })
  const [componentModels, setComponentModels] = useState({
    processor: '',
    motherboard: '',
    memory: '',
    gpu: '',
    ssd: '',
    hdd: '',
    psu: '',
    casing: '',
    cpuCooler: ''
  })
  const [pcBuild, setPcBuild] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleComponentChange = (component, checked) => {
    setExistingComponents(prev => ({
      ...prev,
      [component]: checked
    }))
  }

  const handleModelChange = (component, model) => {
    setComponentModels(prev => ({
      ...prev,
      [component]: model
    }))
  }

  const generatePCBuild = async () => {
    if (!budget || budget <= 0) {
      setError('Please enter a valid budget amount')
      return
    }

    // Check if API token is available
    const apiToken = import.meta.env.VITE_HF_QUANTA_TOKEN
    console.log('Environment check:', {
      hasToken: !!apiToken,
      tokenLength: apiToken?.length,
      tokenPrefix: apiToken?.substring(0, 3) // Only show first 3 chars for debugging
    })
    
    if (!apiToken) {
      setError('API configuration missing. Please contact the administrator.')
      return
    }

    setLoading(true)
    setError('')
    
    // Define existingComponentsList outside try block so it's available in catch
    const existingComponentsList = Object.entries(existingComponents)
      .filter(([key, value]) => value)
      .map(([key, value]) => ({
        component: key,
        model: componentModels[key]
      }))
      .filter(item => item.model.trim() !== '')
    
    try {
      console.log('Generating build for budget:', budget)
      console.log('Existing components:', existingComponentsList)
      console.log('API Token available:', !!apiToken)
      console.log('Making API request to Hugging Face...')

      // Create a comprehensive prompt for AI-based PC build generation
      const excludedComponents = existingComponentsList.map(item => item.component)
      const requiredComponents = ['processor', 'motherboard', 'memory', 'gpu', 'ssd', 'psu', 'casing', 'cpuCooler']
        .filter(comp => !excludedComponents.includes(comp))

      const prompt = `Generate a complete PC build recommendation for ₱${budget} PHP budget in the Philippines market.

${existingComponentsList.length > 0 ? 
  `User already has: ${existingComponentsList.map(item => `${item.component}: ${item.model}`).join(', ')}. Do not include these in the budget.` : 
  'User is building from scratch.'
}

Required components to include: ${requiredComponents.join(', ')}

Provide specific models available in Philippines with realistic 2025 pricing. Ensure compatibility between all components.

Return ONLY a JSON object with this exact structure:
{
  "totalCost": number,
  "components": [
    {"type": "Processor", "model": "specific model name", "price": number, "reason": "explanation"},
    {"type": "Motherboard", "model": "specific model name", "price": number, "reason": "explanation"},
    {"type": "Memory", "model": "specific model name", "price": number, "reason": "explanation"},
    {"type": "Graphics Card", "model": "specific model name", "price": number, "reason": "explanation"},
    {"type": "Storage", "model": "specific model name", "price": number, "reason": "explanation"},
    {"type": "Power Supply", "model": "specific model name", "price": number, "reason": "explanation"},
    {"type": "Case", "model": "specific model name", "price": number, "reason": "explanation"},
    {"type": "CPU Cooler", "model": "specific model name", "price": number, "reason": "explanation"}
  ],
  "performance": "overall system performance description",
  "notes": "compatibility and value notes"
}`

      // Try different models that should work with your token
      let response
      try {
        // First try: Mistral model (good for instructions)
        response = await axios.post(
          'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
          {
            inputs: prompt,
            parameters: {
              max_new_tokens: 800,
              temperature: 0.3,
              do_sample: true,
              top_p: 0.9
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 20000
          }
        )
      } catch (mistralError) {
        console.log('Mistral failed, trying GPT-2:', mistralError.response?.status)
        // Fallback to GPT-2 if Mistral fails
        response = await axios.post(
          'https://api-inference.huggingface.co/models/gpt2',
          {
            inputs: prompt,
            parameters: {
              max_new_tokens: 500,
              temperature: 0.7,
              do_sample: true
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        )
      }

      console.log('API Response:', response.data)

      // Parse the AI response
      let buildData
      let aiResponse = response.data[0]?.generated_text || response.data

      try {
        // Try to extract JSON from the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*?\}/)
        if (jsonMatch) {
          buildData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found in AI response')
        }

        // Validate the response has required structure
        if (!buildData.components || !Array.isArray(buildData.components) || buildData.components.length === 0) {
          throw new Error('Invalid response structure')
        }

        console.log('Successfully parsed AI response:', buildData)

      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError)
        console.log('Raw AI response:', aiResponse)
        
        // If AI response can't be parsed, show error instead of fallback
        throw new Error('AI response could not be parsed as valid JSON')
      }

      setPcBuild(buildData)
      
    } catch (err) {
      console.error('Error generating PC build:', err)
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      })
      
      // No fallback - purely AI-driven
      setError(`AI generation failed: ${err.message || 'Please check your connection and try again.'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            AI PC Build Advisor
          </h1>
          <p className="text-lg text-gray-600">
            Get personalized PC build recommendations based on your budget and existing components
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <DollarSign className="mr-2" />
            Budget Information
          </h2>
          
          <BudgetInput budget={budget} setBudget={setBudget} />

          <ComponentSelector
            existingComponents={existingComponents}
            componentModels={componentModels}
            onComponentChange={handleComponentChange}
            onModelChange={handleModelChange}
          />

          <button
            onClick={generatePCBuild}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2 h-5 w-5" />
                Generating PC Build...
              </>
            ) : (
              'Generate AI PC Build Recommendation'
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {pcBuild && <BuildRecommendation pcBuild={pcBuild} />}
      </div>
    </div>
  )
}

export default PCBuildAdvisor
