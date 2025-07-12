import { useState } from 'react'
import { DollarSign, Loader } from 'lucide-react'
import { HfInference } from '@huggingface/inference'
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

    // Check API token
    const apiToken = import.meta.env.VITE_HF_QUANTA_TOKEN
    console.log('Environment check:', {
      hasToken: !!apiToken,
      tokenLength: apiToken?.length,
      tokenPrefix: apiToken?.substring(0, 3) // Debug
    })
    
    if (!apiToken || apiToken === "your_hugging_face_token_here") {
      setError('MISSING HUGGING FACE TOKEN: Please check your environment variable VITE_HF_QUANTA_TOKEN on Netlify')
      return
    }

    setLoading(true)
    setError('')
    
    // Get existing components
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
      console.log('Initializing Hugging Face client...')

      // Init HF client
      const hf = new HfInference(apiToken)

      // Create prompt
      const excludedComponents = existingComponentsList.map(item => item.component)
      const requiredComponents = ['processor', 'motherboard', 'memory', 'gpu', 'ssd', 'psu', 'casing', 'cpuCooler']
        .filter(comp => !excludedComponents.includes(comp))

      const systemPrompt = `You are a PC build expert specializing in the Philippine market. You create complete PC build recommendations with specific component models, realistic 2025 Philippines pricing, and compatibility analysis. Always respond with valid JSON only.`

      const userPrompt = `Generate a complete PC build recommendation for ₱${budget} PHP budget in the Philippines market.

${existingComponentsList.length > 0 ? 
  `User already has: ${existingComponentsList.map(item => `${item.component}: ${item.model}`).join(', ')}. Do not include these in the budget.` : 
  'User is building from scratch.'
}

Required components to include: ${requiredComponents.join(', ')}

Provide specific models available in Philippines with realistic 2025 pricing. Ensure compatibility between all components.

IMPORTANT: Respond with ONLY valid JSON, no other text or formatting. Use this exact structure:

{
  "totalCost": 50000,
  "components": [
    {"type": "Processor", "model": "AMD Ryzen 5 5600X", "price": 12000, "reason": "Great price to performance ratio"},
    {"type": "Motherboard", "model": "MSI B550M PRO-VDH", "price": 4500, "reason": "Compatible with Ryzen 5000 series"},
    {"type": "Memory", "model": "G.Skill Ripjaws V 16GB DDR4-3200", "price": 4000, "reason": "Optimal capacity for gaming"},
    {"type": "Graphics Card", "model": "RTX 3060", "price": 18000, "reason": "Excellent 1080p gaming performance"},
    {"type": "Storage", "model": "Kingston NV2 500GB NVMe", "price": 2800, "reason": "Fast boot and loading times"},
    {"type": "Power Supply", "model": "Corsair CV650", "price": 3500, "reason": "Adequate power for this build"},
    {"type": "Case", "model": "Cooler Master MasterBox Q300L", "price": 2500, "reason": "Good airflow and cable management"},
    {"type": "CPU Cooler", "model": "Cooler Master Hyper 212", "price": 1800, "reason": "Efficient cooling for mid-range CPU"}
  ],
  "performance": "Great 1080p gaming performance with room for upgrades",
  "notes": "All components are compatible and commonly available in Philippines"
}`

      console.log('Making AI request with Mistral model...')
      
      // Make request
      const response = await hf.chatCompletion({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })

      console.log('AI Response received:', response)

      // Parse response
      const aiResponse = response.choices[0].message.content
      console.log('Raw AI response:', aiResponse)

      let buildData
      try {
        // Clean response
        let cleanedResponse = aiResponse.trim()
        
        // Remove markdown
        cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
        
        // Find JSON bounds
        const jsonStart = cleanedResponse.indexOf('{')
        const jsonEnd = cleanedResponse.lastIndexOf('}') + 1
        
        if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error('No JSON object found in AI response')
        }
        
        const jsonString = cleanedResponse.substring(jsonStart, jsonEnd)
        console.log('Extracted JSON string:', jsonString)
        
        // Parse JSON
        buildData = JSON.parse(jsonString)

        // Validate structure
        if (!buildData.components || !Array.isArray(buildData.components) || buildData.components.length === 0) {
          throw new Error('Invalid response structure - missing components array')
        }

        // Fix component fields
        buildData.components = buildData.components.map(comp => ({
          type: comp.type || 'Unknown Component',
          model: comp.model || 'Model not specified',
          price: typeof comp.price === 'number' ? comp.price : 0,
          reason: comp.reason || 'No reason provided'
        }))

        // Fix total cost
        buildData.totalCost = typeof buildData.totalCost === 'number' ? buildData.totalCost : 
                             buildData.components.reduce((sum, comp) => sum + comp.price, 0)

        console.log('Successfully parsed and validated AI response:', buildData)

      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError)
        console.log('Raw AI response for debugging:', aiResponse)
        
        // Create fallback if response has component info
        if (aiResponse.toLowerCase().includes('processor') || aiResponse.toLowerCase().includes('cpu')) {
          console.log('Attempting to extract component info from text response...')
          
          // Fallback structure
          buildData = {
            totalCost: parseInt(budget) || 0,
            components: [
              {
                type: "AI Response",
                model: "Generated recommendation",
                price: parseInt(budget) || 0,
                reason: "AI provided text response instead of JSON format"
              }
            ],
            performance: "AI generated recommendation",
            notes: `AI Response: ${aiResponse.substring(0, 500)}...`
          }
          
          console.log('Created fallback structure from AI text response')
        } else {
          throw new Error(`AI response could not be parsed as valid JSON: ${parseError.message}`)
        }
      }

      setPcBuild(buildData)
      
    } catch (err) {
      console.error('Error generating PC build:', err)
      
      // Handle errors
      let errorMessage = 'AI generation failed: '
      
      if (err.message.includes('API token') || err.message.includes('Missing')) {
        errorMessage += 'Invalid or missing Hugging Face API token. Please check your environment variables.'
      } else if (err.message.includes('JSON')) {
        errorMessage += 'AI returned invalid format. Please try again.'
      } else if (err.message.includes('network') || err.message.includes('timeout')) {
        errorMessage += 'Network connection issue. Please check your internet and try again.'
      } else {
        errorMessage += err.message || 'Unknown error occurred. Please try again.'
      }
      
      setError(errorMessage)
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
