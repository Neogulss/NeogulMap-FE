export const categoryData = {
    '외식업': ['분식전문점', '양식음식점', '일식음식점', '제과점', '중식음식점', '치킨전문점', '커피-음료', '패스트푸드점', '한식음식점', '호프-간이주점', '반찬가게', '미곡판매', '육류판매', '수산물판매'],
    '소매업': ['가구', '가방', '가전제품', '모터사이클및부품', '문구', '미용재료', '서적', '섬유제품', '시계및귀금속', '신발', '악기', '안경', '애완동물', '예술품', '완구', '운동/경기용품', '유아의류', '의료기기', '의약품', '일반의류', '자동차부품', '자전거 및 기타운송장비', '재생용품 판매점', '조명용품', '주류도매', '중고가구', '철물점', '청과상', '컴퓨터및주변장치판매', '편의점', '한복점', '핸드폰', '화장품', '화초', '슈퍼마켓'],
    '서비스업': ['가전제품수리', '가정용품임대', '건축물청소', '네일숍', '녹음실', '모터사이클수리', '미용실', '법무사사무소', '변리사사무소', '변호사사무소', '부동산중개업', '사진관', '세무사사무소', '세탁소', '의류임대', '인테리어', '자동차미용', '자동차수리', '통번역서비스', '통신기기수리', '피부관리실', '회계사사무소', '여행사', '기타법무서비스'],
    '교육/의료': ['독서실', '동물병원', '예술학원', '외국어학원', '일반교습학원', '일반의원', '치과의원', '컴퓨터학원', '한의원', '고시원'],
    '여가/오락': ['DVD방', 'PC방', '골프연습장', '기타오락장', '노래방', '당구장', '볼링장', '스포츠 강습', '스포츠클럽', '전자게임장', '복권방', '게스트하우스', '여관'],
};
categoryData['전체'] = Object.values(categoryData).flat();

export const mockDataList = [
    {
        id: 1, name: '연남동', score: 92, grade: 'A 등급 (상위 5%)', lat: 37.564, lng: 126.923, count: 8,
        desc: '1.5층/반지하 매물 추천 지역',
        summaryComments: [
            '연남동 골목상권의 강세가 전년동기에 비해 <strong>증가</strong>하고 있습니다.',
            '선택업종의 매출액이 전년대비 <strong>감소</strong> 추세입니다.',
            '이면도로는 유동인구가 <strong>증가</strong>하고 있는 지역입니다.',
        ],
        statSummary: {
            stores: { current: 109, diffLabel: '전분기 대비', diffVal: '-1개', diffType: 'down', rank: 4 },
            sales:  { current: 2172, diffLabel: '전분기 대비', diffVal: '+66만원', diffType: 'up', rank: 11 },
            pop:    { current: 77891, diffLabel: '전분기 대비', diffVal: '-2,577명', diffType: 'down', rank: 15 },
        },
        historyData: {
            stores: [106, 103, 106, 110, 109],
            survival: [53.85, 60.87, 71.43, 70, 58.82],
            operating: { selected: 2.9, dong: 3.4, district: 3.1, seoul: 3 },
            sales: [2213, 2488, 2120, 2106, 2172],
            salesHourly: [0, 12.9, 21, 26, 33.4, 6.7],
        },
        compareData: {
            storesCompare: [109/110 * 100, 567/600 * 100, 7234/7500 * 100],
            industry: { food: 34.6, service: 34.8, retail: 30.7 },
            salesDistrict: [1269, 1178, 1249, 1253, 1297],
            salesSeoul: [732, 686, 701, 694, 737],
        },
        swot: {
            s: '목적성 소비를 띄는 2030 세대의 절대적 유입량 확보.',
            w: '초기 진입 시 권리금 부담 및 오프라인 주차 공간 부족.',
            o: 'SNS 바이럴 마케팅 효율이 전국에서 가장 높은 지역.',
            t: '트렌드 변화가 빠르고 인근 매장과의 아이템 중복 우려.',
        },
        advice: '1억 원 자본금으로는 연남동 메인 거리 1층 진입은 무리. 이면도로를 공략하여 트렌디한 컨셉을 내세우는 것을 추천합니다.',
    },
    {
        id: 2, name: '서교동', score: 88, grade: 'A- 등급 (상위 12%)', lat: 37.553, lng: 126.920, count: 12,
        desc: '직장인 및 대학생 혼합 유입 지역',
        summaryComments: [
            '서교동은 매물 <strong>증가</strong>세가 전년동기에 비해 소폭입니다.',
            '매출액이 전년대비 <strong>증가</strong> 추세입니다.',
        ],
        statSummary: {
            stores: { current: 210, diffLabel: '전분기 대비', diffVal: '+3개', diffType: 'up', rank: 1 },
            sales:  { current: 3200, diffLabel: '전분기 대비', diffVal: '+120만원', diffType: 'up', rank: 3 },
            pop:    { current: 95000, diffLabel: '전분기 대비', diffVal: '+5000명', diffType: 'up', rank: 5 },
        },
        historyData: {
            stores: [200, 205, 202, 207, 210],
            survival: [60, 65, 75, 72, 68],
            operating: { selected: 3.5, dong: 3.8, district: 3.1, seoul: 3 },
            sales: [3000, 3100, 3050, 3080, 3200],
            salesHourly: [5, 15, 25, 28, 20, 7],
        },
        compareData: {
            storesCompare: [210/215*100, 567/600*100, 7234/7500*100],
            industry: { food: 40.2, service: 30.8, retail: 29.0 },
            salesDistrict: [1269, 1178, 1249, 1253, 1297],
            salesSeoul: [732, 686, 701, 694, 737],
        },
        swot: {
            s: '높은 유동인구와 대학가 배후수요로 안정적인 매출 기반 확보.',
            w: '경쟁 업체가 많아 차별화 전략 없이는 생존이 어렵습니다.',
            o: '대학생 및 직장인 타겟 회전율 극대화 시스템 도입 가능.',
            t: '임대료 상승 압박과 배달앱 의존도가 높아지는 추세.',
        },
        advice: '경쟁이 치열합니다. 대학생과 직장인을 타겟으로 회전율을 극대화할 수 있는 시스템 도입이 생존의 열쇠입니다.',
    },
    {
        id: 3, name: '합정동', score: 85, grade: 'B+ 등급 (상위 20%)', lat: 37.549, lng: 126.913, count: 6,
        desc: '오후-저녁 퇴근길 소비 집중 지역',
        summaryComments: [
            '합정동 배후 오피스의 상주 인구가 <strong>증가</strong> 추세입니다.',
            '매출액이 전년대비 <strong>정체</strong> 상태입니다.',
        ],
        statSummary: {
            stores: { current: 155, diffLabel: '전분기 대비', diffVal: '+1개', diffType: 'up', rank: 6 },
            sales:  { current: 2800, diffLabel: '전분기 대비', diffVal: '-30만원', diffType: 'down', rank: 9 },
            pop:    { current: 65000, diffLabel: '전분기 대비', diffVal: '-1000명', diffType: 'down', rank: 18 },
        },
        historyData: {
            stores: [150, 152, 153, 154, 155],
            survival: [55, 62, 70, 69, 60],
            operating: { selected: 3.1, dong: 3.5, district: 3.1, seoul: 3 },
            sales: [2850, 2900, 2800, 2830, 2800],
            salesHourly: [0, 10, 20, 25, 35, 10],
        },
        compareData: {
            storesCompare: [155/160*100, 567/600*100, 7234/7500*100],
            industry: { food: 38.0, service: 28.0, retail: 34.0 },
            salesDistrict: [1269, 1178, 1249, 1253, 1297],
            salesSeoul: [732, 686, 701, 694, 737],
        },
        swot: {
            s: '퇴근길 유동인구가 안정적으로 유지되는 지역입니다.',
            w: '저녁 이후 유동인구가 급감하여 야간 매출이 약합니다.',
            o: '오피스 밀집 지역으로 점심 시간대 추가 매출 확대 가능.',
            t: '주변 대형 쇼핑몰과의 경쟁으로 소비 분산 우려.',
        },
        advice: '저녁 시간대 매출 비중이 높은 곳입니다. 저녁 시간대에 특화된 메뉴 구성이 필요합니다.',
    },
];
