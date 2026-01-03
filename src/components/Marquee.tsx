"use client";

const statusItems = [
  { label: "DATA SYNC", status: "ACTIVE", color: "emerald" },
  { label: "SECURE CONNECTION", status: "ENCRYPTED", color: "blue" },
  { label: "SERVER STATUS", status: "OK", color: "emerald" },
  { label: "LIVE DATA FEED", status: "STREAMING", color: "emerald" },
  { label: "SECURE CONNECTION", status: "ENCRYPTED", color: "blue" },
  { label: "SERVER STATUS", status: "OK", color: "emerald" },
  { label: "LIVE DATA FEED", status: "STREAMING", color: "emerald" },
  { label: "SECURE CONNECTION", status: "ENCRYPTED", color: "blue" },
];

export default function Marquee() {
  return (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      backgroundColor: '#030712',
      borderTop: '1px solid #1e293b',
      borderBottom: '1px solid #1e293b',
      padding: '16px 0'
    }}>
      <div className="animate-marquee" style={{
        display: 'flex',
        whiteSpace: 'nowrap'
      }}>
        {[...statusItems, ...statusItems].map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '0 32px',
              fontSize: '14px',
              fontFamily: 'monospace'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: item.color === "emerald" ? '#10b981' : '#3b82f6'
              }}
            ></span>
            <span style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {item.label}
            </span>
            <span style={{ color: item.color === "emerald" ? '#34d399' : '#60a5fa' }}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
