export const createFallbackBuild = (budget, existingComponents) => {
  const availableBudget = parseFloat(budget)
  const hasProcessor = existingComponents.some(c => c.component === 'processor')
  const hasGPU = existingComponents.some(c => c.component === 'gpu')
  const hasMotherboard = existingComponents.some(c => c.component === 'motherboard')
  
  let components = []
  let totalCost = 0

  if (!hasProcessor) {
    if (availableBudget >= 30000) {
      components.push({ 
        type: 'Processor', 
        model: 'AMD Ryzen 5 5600X', 
        price: 12000, 
        reason: 'Excellent price-to-performance ratio for gaming and productivity' 
      })
      totalCost += 12000
    } else if (availableBudget >= 20000) {
      components.push({ 
        type: 'Processor', 
        model: 'AMD Ryzen 5 3600', 
        price: 8000, 
        reason: 'Great budget CPU with solid performance' 
      })
      totalCost += 8000
    } else {
      components.push({ 
        type: 'Processor', 
        model: 'AMD Ryzen 3 3200G', 
        price: 5500, 
        reason: 'Budget CPU with integrated graphics' 
      })
      totalCost += 5500
    }
  }

  if (!hasMotherboard) {
    components.push({ 
      type: 'Motherboard', 
      model: 'MSI B450M PRO-VDH MAX', 
      price: 4500, 
      reason: 'Reliable micro-ATX motherboard with good features' 
    })
    totalCost += 4500
  }

  if (!existingComponents.some(c => c.component === 'memory')) {
    components.push({ 
      type: 'Memory', 
      model: '16GB DDR4-3200 (2x8GB)', 
      price: 3500, 
      reason: '16GB is the sweet spot for modern gaming and multitasking' 
    })
    totalCost += 3500
  }

  if (!hasGPU && availableBudget >= 25000) {
    if (availableBudget >= 50000) {
      components.push({ 
        type: 'Graphics Card', 
        model: 'RTX 4060 Ti', 
        price: 25000, 
        reason: 'Great 1440p gaming performance with ray tracing support' 
      })
      totalCost += 25000
    } else if (availableBudget >= 35000) {
      components.push({ 
        type: 'Graphics Card', 
        model: 'RTX 4060', 
        price: 18000, 
        reason: 'Solid 1080p gaming performance with modern features' 
      })
      totalCost += 18000
    }
  }

  // Add remaining components based on remaining budget
  const remainingBudget = availableBudget - totalCost

  if (!existingComponents.some(c => c.component === 'ssd') && remainingBudget >= 3000) {
    components.push({ 
      type: 'SSD Storage', 
      model: '500GB NVMe SSD', 
      price: 3000, 
      reason: 'Fast boot times and application loading' 
    })
    totalCost += 3000
  }

  if (!existingComponents.some(c => c.component === 'psu') && remainingBudget >= 3500) {
    components.push({ 
      type: 'Power Supply', 
      model: '650W 80+ Bronze PSU', 
      price: 3500, 
      reason: 'Reliable power delivery with efficiency certification' 
    })
    totalCost += 3500
  }

  if (!existingComponents.some(c => c.component === 'casing') && remainingBudget >= 2500) {
    components.push({ 
      type: 'PC Case', 
      model: 'Cooler Master MasterBox Q300L', 
      price: 2500, 
      reason: 'Compact micro-ATX case with good airflow' 
    })
    totalCost += 2500
  }

  if (!existingComponents.some(c => c.component === 'cpuCooler') && remainingBudget >= 1500) {
    components.push({ 
      type: 'CPU Cooler', 
      model: 'Cooler Master Hyper 212', 
      price: 1500, 
      reason: 'Reliable air cooler for most CPUs' 
    })
    totalCost += 1500
  }

  return {
    totalCost,
    components,
    performance: availableBudget >= 40000 ? 'High-end gaming and content creation' : 
                 availableBudget >= 25000 ? 'Solid 1080p gaming performance' : 
                 'Budget-friendly for basic gaming and productivity',
    notes: `This build is optimized for your ₱${budget} PHP budget. Prices are estimated based on Philippine market rates and may vary.`
  }
}
