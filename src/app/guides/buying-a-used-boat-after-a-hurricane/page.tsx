import TopicGuidePage, { topicGuideMetadata } from '@/components/TopicGuide'
import { getTopicGuide } from '@/lib/topic-guides'

const g = getTopicGuide('buying-a-used-boat-after-a-hurricane')
export const metadata = topicGuideMetadata(g)

export default function Page() {
  return <TopicGuidePage g={g} />
}
