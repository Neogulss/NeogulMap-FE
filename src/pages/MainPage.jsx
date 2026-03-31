import React from 'react'
import CustomButton from '../components/common/CustomButton';
import CustomInput from '../components/common/CustomInput';
import CustomDropdown from '../components/common/CustomDropdown';
import CustomCard from '../components/common/CustomCard';

export default function MainPage() {
  return (
  <>
   <CustomButton variant="pin">버튼</CustomButton>
        <CustomInput placeholder="검색어를 입력해주세요." />
        <CustomDropdown
          placeholder="업종 선택"
          options={["카페", "음식점", "편의점", "미용실"]}
          variant="white"
        />
        <CustomCard className="w-[400px]">
          <div className="text-lg font-semibold mb-3">
            경기도 성남시 분당구 정자동
          </div>
  
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm">
              서비스업
            </span>
            <span className="px-3 py-1 bg-neutral-200 text-neutral-700 rounded-lg text-sm">
              자본금 2억 원 이상
            </span>
          </div>
  
          <div className="border-t pt-3 flex justify-end">
            <button className="text-green-600 font-medium">
              상세 리포트 보기 →
            </button>
          </div>
        </CustomCard>
        <CustomCard
          onClick={() => console.log("카드 클릭")}
          className="w-[300px]"
        >
          <div className="text-lg font-semibold">편의점</div>
          <div className="text-2xl font-bold mt-2">월 평균 4,180 만원</div>
        </CustomCard>
  </>
  )
}
