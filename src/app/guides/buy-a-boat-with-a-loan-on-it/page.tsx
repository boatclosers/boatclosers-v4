import TopicGuidePage, { topicGuideMetadata } from '@/components/TopicGuide'
import { getTopicGuide } from '@/lib/topic-guides'

const g = getTopicGuide('buy-a-boat-with-a-loan-on-it')
export const metadata = topicGuideMetadata(g)

export default function Page() {
  return <TopicGuidePage g={g} />
}
