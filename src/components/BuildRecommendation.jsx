function BuildRecommendation({ pcBuild }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 fade-in">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Recommended PC Build
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Components</h3>
          <div className="space-y-4">
            {pcBuild.components.map((component, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 build-card">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">{component.type}</h4>
                  <span className="text-lg font-bold text-green-600 price-highlight">
                    ₱{component.price.toLocaleString()}
                  </span>
                </div>
                <p className="font-medium text-gray-700 mb-2">{component.model}</p>
                <p className="text-sm text-gray-600">{component.reason}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Summary</h3>
            <div className="text-3xl font-bold text-green-600 mb-2 price-highlight">
              ₱{pcBuild.totalCost.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Total Cost</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Expected Performance</h4>
            <p className="text-sm text-gray-700">{pcBuild.performance}</p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
            <p className="text-sm text-gray-700">{pcBuild.notes}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuildRecommendation
