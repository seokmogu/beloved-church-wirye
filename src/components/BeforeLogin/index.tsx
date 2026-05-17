import React from 'react'

const BeforeLogin: React.FC = () => {
  return (
    <div
      style={{
        border: '1px solid rgba(15, 23, 42, 0.12)',
        borderRadius: 12,
        marginBottom: 24,
        padding: 20,
      }}
    >
      <p style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>관리자 로그인</p>
      <p style={{ margin: 0, opacity: 0.72 }}>
        위례 사랑하는교회 사이트 콘텐츠와 디자인을 관리하는 화면입니다.
      </p>
    </div>
  )
}

export default BeforeLogin
