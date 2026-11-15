import TopicGuidePage, { topicGuideMetadata } from '@/components/TopicGuide'
import { getTopicGuide } from '@/lib/topic-guides'

const g = getTopicGuide('agreed-on-a-price-for-a-boat-now-what')
export const metadata = topicGuideMetadata(g)

export default function Page() {
  return <TopicGuidePage g={g} />
}
