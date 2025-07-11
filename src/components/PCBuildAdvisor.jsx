import { useState } from 'react'
import { DollarSign, Loader } from 'lucide-react'
import axios from 'axios'
import ComponentSelector from './ComponentSelector'
import BudgetInput from './BudgetInput'
import BuildRecommendation from './BuildRecommendation'
import { createFallbackBuild } from '../utils/fallbackBuild'

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
    if (!apiToken) {
      setError('API configuration missing. Please contact the administrator.')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const existingComponentsList = Object.entries(existingComponents)
        .filter(([key, value]) => value)
        .map(([key, value]) => ({
          component: key,
          model: componentModels[key]
        }))
        .filter(item => item.model.trim() !== '')

      const prompt = `Create a PC build recommendation for a budget of ₱${budget} PHP (Philippine Pesos). 
      
      ${existingComponentsList.length > 0 ? 
        `The user already has these components: ${existingComponentsList.map(item => `${item.component}: ${item.model}`).join(', ')}. 
        Please ensure compatibility with these existing components and do not include them in the budget calculation.` : 
        'The user is building a PC from scratch.'
      }
      
      Please provide a detailed PC build list with:
      1. Component names and specific models
      2. Estimated prices in PHP
      3. Brief explanation of why each component was chosen
      4. Total cost breakdown
      5. Performance expectations
      
      Focus on current market availability in the Philippines and provide realistic pricing. Ensure all components are compatible with each other.
      
      Format the response as a JSON object with the following structure:
      {
        "totalCost": number,
        "components": [
          {
            "type": "string",
            "model": "string", 
            "price": number,
            "reason": "string"
          }
        ],
        "performance": "string",
        "notes": "string"
      }`

      // Using Hugging Face API
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.7,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_HF_QUANTA_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      )

      // Parse the AI response
      let aiResponse = response.data[0]?.generated_text || response.data
      
      // If the API doesn't return proper JSON, create a fallback response
      let buildData
      try {
        buildData = JSON.parse(aiResponse)
      } catch {
        // Fallback PC build suggestion
        buildData = createFallbackBuild(budget, existingComponentsList)
      }

      setPcBuild(buildData)
    } catch (err) {
      console.error('Error generating PC build:', err)
      // Use fallback build on API error
      const fallbackBuild = createFallbackBuild(budget, existingComponentsList)
      setPcBuild(fallbackBuild)
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
