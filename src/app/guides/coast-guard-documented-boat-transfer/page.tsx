import TopicGuidePage, { topicGuideMetadata } from '@/components/TopicGuide'
import { getTopicGuide } from '@/lib/topic-guides'

const g = getTopicGuide('coast-guard-documented-boat-transfer')
export const metadata = topicGuideMetadata(g)

export default function Page() {
  return <TopicGuidePage g={g} />
}
