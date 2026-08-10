export const advertisementTranscriptPlaceholder = `이미지 원문에 있는 제목·구획·불릿을 순서 그대로 입력합니다.
이미지에 없는 항목(일정·장소·신청 등)은 추가하지 않습니다.

예시 — 실제 광고 형식은 이미지마다 다를 수 있습니다.
## 이미지의 제목
- 첫 번째 안내
- 두 번째 안내`

/**
 * 광고의 구성은 이미지마다 다르다. 전사기가 반환한 블록을 빈 블록만
 * 제외하고 원문 순서 그대로 연결해, 임의의 제목이나 정보를 덧붙이지 않는다.
 */
export function composeAdvertisementTranscript(blocks: readonly string[]): string {
  return blocks
    .map((block) => block.trim())
    .filter(Boolean)
    .join('\n\n')
}
