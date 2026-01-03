"use client";

const capabilities = [
  {
    title: "Real-Time Telemetry",
    description: "Instantaneous data transmission for caregiver attendance and patient vitals.",
    icon: (
      <svg style={{ width: '32px', height: '32px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Secure Protocol",
    description: "End-to-end encryption for all patient records and staff logs.",
    icon: (
      <svg style={{ width: '32px', height: '32px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: "Live Sync",
    description: "Multi-device synchronization ensures data consistency across the facility.",
    icon: (
      <svg style={{ width: '32px', height: '32px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
];

const features = [
  {
    title: "High-Density Visualization",
    description: "Our interface is designed for rapid information processing. LED-style status indicators allow for immediate recognition of critical patient needs.",
    icon: (
      <svg style={{ width: '40px', height: '40px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Smart Storage Integration",
    description: "Physical smart storage units with LED indicators and weight sensors connect wirelessly to provide real-time inventory tracking and guided medication retrieval.",
    icon: (
      <svg style={{ width: '40px', height: '40px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
];

export default function SystemCapabilities() {
  return (
    <section style={{ padding: '96px 24px', backgroundColor: '#0a0f1c' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Section Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
            SYSTEM CAPABILITIES
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '640px', margin: '0 auto', fontSize: '16px' }}>
            Advanced features designed for modern healthcare facility management
          </p>
        </div>

        {/* Top Capabilities Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px',
          marginBottom: '64px'
        }}>
          {capabilities.map((capability, index) => (
            <div
              key={capability.title}
              className={`reveal delay-${(index + 1) * 100}`}
              style={{ textAlign: 'center', padding: '32px' }}
            >
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                color: '#34d399',
                marginBottom: '24px'
              }}>
                {capability.icon}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>
                {capability.title}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.6 }}>
                {capability.description}
              </p>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '32px'
        }}>
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={index === 0 ? "reveal-left" : "reveal-right"}
              style={{
                padding: '32px',
                backgroundColor: '#0f172a',
                borderRadius: '16px',
                border: '1px solid #1e293b',
                transition: 'border-color 0.3s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                <div style={{
                  flexShrink: 0,
                  padding: '16px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))',
                  borderRadius: '16px',
                  color: '#34d399'
                }}>
                  {feature.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '15px' }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hardware Integration Preview */}
        <div className="reveal" style={{
          marginTop: '64px',
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
          borderRadius: '16px',
          border: '1px solid #1e293b'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '32px'
          }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{
                width: '128px',
                height: '128px',
                backgroundColor: '#0f172a',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #1e293b'
              }}>
                <svg
                  style={{ width: '64px', height: '64px', color: '#34d399' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
                Arduino-Powered Hardware
              </h3>
              <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '15px', lineHeight: 1.6 }}>
                Our smart storage system uses Arduino microcontrollers for
                precise weight sensing and LED control, communicating via
                WiFi/Serial with this dashboard.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{
                  padding: '8px 16px',
                  backgroundColor: '#0f172a',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  ESP32 Compatible
                </span>
                <span style={{
                  padding: '8px 16px',
                  backgroundColor: '#0f172a',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  WebSocket API
                </span>
                <span style={{
                  padding: '8px 16px',
                  backgroundColor: '#0f172a',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  color: '#a78bfa',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                  Load Cells
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
