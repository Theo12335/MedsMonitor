"use client";

export default function FacilityManifest() {
  return (
    <section style={{ padding: '96px 24px', backgroundColor: '#030712' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '64px',
          alignItems: 'center'
        }}>
          {/* Left Content */}
          <div className="reveal-left">
            <h2 style={{
              fontSize: '48px',
              fontWeight: 700,
              color: 'white',
              marginBottom: '24px',
              lineHeight: 1.1
            }}>
              FACILITY<br />
              <span style={{ color: '#64748b' }}>MANIFEST</span>
            </h2>
            <p style={{
              color: '#94a3b8',
              marginBottom: '32px',
              maxWidth: '420px',
              fontSize: '16px',
              lineHeight: 1.7
            }}>
              Operational details and contact protocols for the Smart Care
              Monitor network.
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#64748b',
              fontFamily: 'monospace'
            }}>
              <span style={{
                padding: '6px 10px',
                backgroundColor: '#0f172a',
                borderRadius: '6px',
                border: '1px solid #1e293b'
              }}>
                SYS_INFO
              </span>
              <span style={{ color: '#475569' }}>|</span>
              <span>SYSTEM_CAT_01</span>
            </div>
          </div>

          {/* Right Content - Building Image Placeholder */}
          <div className="reveal-right">
            <div style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid #1e293b',
              backgroundColor: '#0f172a'
            }}>
              <div style={{
                aspectRatio: '16/9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ textAlign: 'center', padding: '32px' }}>
                  <div style={{
                    width: '96px',
                    height: '96px',
                    margin: '0 auto 16px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg
                      style={{ width: '48px', height: '48px', color: '#34d399' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <p style={{ color: '#34d399', fontWeight: 600, fontSize: '18px' }}>Smart Care</p>
                  <p style={{ color: '#64748b', fontSize: '14px' }}>Healthcare Facility</p>
                </div>
              </div>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '96px',
                background: 'linear-gradient(to top, #030712, transparent)'
              }}></div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="reveal" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginTop: '64px'
        }}>
          {/* Location */}
          <div style={{
            padding: '24px',
            backgroundColor: '#0f172a',
            borderRadius: '16px',
            border: '1px solid #1e293b'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px'
            }}>
              System Provider
            </div>
            <p style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>
              Smart Care Monitor Healthcare Center
            </p>
          </div>

          {/* Address */}
          <div style={{
            padding: '24px',
            backgroundColor: '#0f172a',
            borderRadius: '16px',
            border: '1px solid #1e293b'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px'
            }}>
              Location Data
            </div>
            <p style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>123 Healthcare Avenue</p>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Medical District, MD 12345</p>
          </div>

          {/* Contact */}
          <div style={{
            padding: '24px',
            backgroundColor: '#0f172a',
            borderRadius: '16px',
            border: '1px solid #1e293b'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px'
            }}>
              Direct Channel
            </div>
            <p style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>(555) 123-4567</p>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>contact@smartcaremonitor.com</p>
          </div>

          {/* Uptime */}
          <div style={{
            padding: '24px',
            backgroundColor: '#0f172a',
            borderRadius: '16px',
            border: '1px solid #1e293b'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px'
            }}>
              System Uptime
            </div>
            <p style={{ color: '#34d399', fontWeight: 700, fontSize: '28px' }}>99.98%</p>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Last downtime: None recorded</p>
          </div>
        </div>
      </div>
    </section>
  );
}
