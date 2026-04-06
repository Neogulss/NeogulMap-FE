import { categoryData } from '../../data/analysisData';

const CAT_TABS = [
    { id: '전체', label: '전체', iconPath: 'M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z' },
    { id: '외식업', label: '외식업', iconPath: 'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z' },
    { id: '소매업', label: '소매업', iconPath: 'M16 6V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H2v13c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6h-6zm-6-2h4v2h-4V4zm10 15H4V8h16v13z' },
    { id: '서비스업', label: '서비스업', iconPath: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
    { id: '교육/의료', label: '교육/의료', iconPath: 'M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z' },
    { id: '여가/오락', label: '여가/오락', iconPath: 'M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 9 18.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z' },
];

export default function LeftPanel({
    isCollapsed, onToggle, selectedCategory, onCategoryChange, selectedSubCategory, onSubCategoryChange,
    budgetMin, budgetMax, onBudgetMinChange, onBudgetMaxChange, onSearch, resultList, isAnalyzing, activeCardId, onSelectData,
}) {
    const subCategories = categoryData[selectedCategory] || [];

    return (
        <aside className={`left-panel${isCollapsed ? ' collapsed' : ''}`} id="left-panel">
            <button className="panel-toggle left-toggle" id="left-toggle-btn" onClick={onToggle}>
                {isCollapsed ? '❯' : '❮'}
            </button>

            <div className="filter-section">
                <div className="form-label">창업 희망 업종</div>
                <div className="cat-tabs" id="cat-tabs">
                    {CAT_TABS.map(cat => (
                        <div key={cat.id} className={`cat-tab${selectedCategory === cat.id ? ' active' : ''}`} onClick={() => onCategoryChange(cat.id)}>
                            <svg viewBox="0 0 24 24"><path d={cat.iconPath} /></svg>
                            {cat.label}
                        </div>
                    ))}
                </div>

                <div className="sub-grid-wrap">
                    <div className="sub-grid" id="sub-grid">
                        {subCategories.map(item => (
                            <div key={item} className={`sub-btn${selectedSubCategory === item ? ' active' : ''}`} onClick={() => onSubCategoryChange(item)}>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-label">창업 자본금 범위 설정</div>
                <div className="budget-inputs-wrap">
                    <div className="budget-input-group">
                        <input type="number" className="budget-input" placeholder="최소 금액" min="0" value={budgetMin} onChange={e => onBudgetMinChange(e.target.value)} />
                        <span className="budget-unit">만원</span>
                    </div>
                    <span className="budget-tilde">~</span>
                    <div className="budget-input-group">
                        <input type="number" className="budget-input" placeholder="최대 금액" min="0" value={budgetMax} onChange={e => onBudgetMaxChange(e.target.value)} />
                        <span className="budget-unit">만원</span>
                    </div>
                </div>

                <button className="btn-search" onClick={onSearch}>AI 맞춤 입지 분석하기</button>
            </div>

            <div className="list-section">
                <div className="list-header"><strong>추천 지역 리스트</strong></div>
                <div id="result-list">
                    {isAnalyzing ? (
                        <p style={{ fontSize: '14px', color: 'var(--g)', fontWeight: '700', textAlign: 'center', marginTop: '40px' }}>
                            조건에 맞는 상권을 찾고 있습니다... 🐾
                        </p>
                    ) : resultList.length === 0 ? (
                        <p style={{ fontSize: '14px', color: 'var(--text3)', textAlign: 'center', marginTop: '40px' }}>
                            조건을 입력하고<br />분석 버튼을 눌러주세요.
                        </p>
                    ) : (
                        resultList.map((data, idx) => (
                            <div key={data.id} className={`list-card${activeCardId === data.id ? ' active' : ''}`} onClick={() => onSelectData(data, idx)}>
                                <div className="lc-head">
                                    <div className="lc-title">{data.districtName} {data.name}</div>
                                </div>
                                <div className="lc-desc">
                                    <strong style={{ color: 'var(--g)' }}>[{selectedSubCategory}]</strong> {data.desc}
                                </div>
                                <div className="lc-meta">
                                    <span className="lc-tag">점포수 {data.count > 0 ? `${data.count}개` : '-'}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </aside>
    );
}