import TopicGuidePage, { topicGuideMetadata } from '@/components/TopicGuide'
import { getTopicGuide } from '@/lib/topic-guides'

const g = getTopicGuide('sell-an-inherited-boat')
export const metadata = topicGuideMetadata(g)

export default function Page() {
  return <TopicGuidePage g={g} />
}
