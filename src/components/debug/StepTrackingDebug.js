import { useState, useEffect } from 'react';
import stepTracker from '../../utils/stepTracking';

/**
 * Debug component to show step tracking data in development
 * Only renders in development environment
 */
const StepTrackingDebug = () => {
  const [trackingData, setTrackingData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [events, setEvents] = useState([]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  useEffect(() => {
    const updateTrackingData = () => {
      const summary = stepTracker.getTrackingSummary();
      setTrackingData(summary);
      
      if (summary && summary.events) {
        // Show only last 10 events
        setEvents(summary.events.slice(-10).reverse());
      }
    };

    // Update initially
    updateTrackingData();

    // Update every 2 seconds
    const interval = setInterval(updateTrackingData, 2000);

    return () => clearInterval(interval);
  }, []);

  const clearData = () => {
    stepTracker.clearTrackingData();
    setTrackingData(null);
    setEvents([]);
  };

  const testApplicationIdUpdate = () => {
    const testAppId = `test_app_${Date.now()}`;
    stepTracker.updateApplicationId(testAppId);
    updateTrackingData();
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getEventColor = (event) => {
    const colors = {
      step_viewed: 'bg-blue-100 text-blue-800',
      step_started: 'bg-green-100 text-green-800',
      step_completed: 'bg-purple-100 text-purple-800',
      form_field_focused: 'bg-yellow-100 text-yellow-800',
      form_field_completed: 'bg-orange-100 text-orange-800',
      form_validation_error: 'bg-red-100 text-red-800',
      step_navigation: 'bg-indigo-100 text-indigo-800',
      application_started: 'bg-emerald-100 text-emerald-800',
      application_submitted: 'bg-rose-100 text-rose-800',
    };
    return colors[event] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white px-3 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-blue-700 transition-colors"
        title="Toggle Step Tracking Debug"
      >
        📊 {events.length}
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="absolute bottom-12 right-0 w-96 bg-white border border-gray-300 rounded-lg shadow-xl max-h-96 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Step Tracking Debug</h3>
            <div className="flex space-x-2">
              <button
                onClick={testApplicationIdUpdate}
                className="text-xs text-blue-600 hover:text-blue-800"
                title="Test App ID update"
              >
                Test
              </button>
              <button
                onClick={clearData}
                className="text-xs text-red-600 hover:text-red-800"
                title="Clear tracking data"
              >
                Clear
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>

          {/* Summary */}
          {trackingData && (
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Session:</span> {trackingData.sessionId.slice(-8)}
                </div>
                <div>
                  <span className="font-medium">Step:</span> {trackingData.currentStep}/5
                </div>
                <div>
                  <span className="font-medium">Events:</span> {trackingData.totalEvents}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {Math.round((Date.now() - trackingData.startTime) / 1000)}s
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 grid grid-cols-1 gap-1">
                <div>
                  <span className="font-medium">App ID:</span> {stepTracker.getTrackingState().applicationId || 'null'}
                </div>
                <div>
                  <span className="font-medium">Campaign ID:</span> {stepTracker.getTrackingState().campaignId || 'null'}
                </div>
              </div>
            </div>
          )}

          {/* Events List */}
          <div className="max-h-64 overflow-y-auto">
            {events.length > 0 ? (
              <div className="p-2 space-y-1">
                {events.map((event, index) => (
                  <div
                    key={index}
                    className="text-xs border border-gray-200 rounded p-2 bg-white"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getEventColor(event.event)}`}>
                        {event.event}
                      </span>
                      <span className="text-gray-500">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                    
                    <div className="text-gray-600">
                      {event.stepName && (
                        <div>Step: {event.stepName}</div>
                      )}
                      {event.fieldName && (
                        <div>Field: {event.fieldName}</div>
                      )}
                      {event.errorMessage && (
                        <div className="text-red-600">Error: {event.errorMessage}</div>
                      )}
                      {event.method && (
                        <div>Method: {event.method}</div>
                      )}
                      {event.buttonType && (
                        <div>Button: {event.buttonType}</div>
                      )}
                      {event.documentType && (
                        <div>Document: {event.documentType}</div>
                      )}
                      {event.timeSpent !== undefined && (
                        <div>Time: {Math.round(event.timeSpent / 1000)}s</div>
                      )}
                      {event.completionPercentage !== undefined && (
                        <div>Completion: {Math.round(event.completionPercentage)}%</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                No tracking events yet
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-600">
            <div>
              💡 This panel shows real-time step tracking data for debugging purposes.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepTrackingDebug;
