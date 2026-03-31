/**
 * Fix sermon page YouTube video
 * Removes the Rick Astley video placeholder from the /sermon page
 */

import { getPayload } from 'payload'
import config from '@payload-config'

async function fixSermonPage() {
  const payload = await getPayload({ config })

  console.log('🔍 Finding sermon page...')

  // Find the sermon page
  const pages = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: 'sermon',
      },
    },
    limit: 1,
  })

  if (pages.docs.length === 0) {
    console.log('❌ No sermon page found')
    return
  }

  const sermonPage = pages.docs[0]
  console.log(`✅ Found sermon page: ${sermonPage.title} (ID: ${sermonPage.id})`)

  // Check if there are any YouTubeBlock with dQw4w9WgXcQ
  const layout = sermonPage.layout as any[]
  let hasRickAstley = false
  let blockIndex = -1

  if (layout) {
    layout.forEach((block, index) => {
      if (block.blockType === 'youtubeBlock' && block.videoId === 'dQw4w9WgXcQ') {
        hasRickAstley = true
        blockIndex = index
        console.log(`🚨 Found Rick Astley video at block index ${index}`)
      }
    })
  }

  if (!hasRickAstley) {
    console.log('✅ No Rick Astley video found - page is clean!')
    return
  }

  // Remove the block
  console.log('🔧 Removing Rick Astley video block...')
  const newLayout = layout.filter((_, index) => index !== blockIndex)

  // Update the page
  await payload.update({
    collection: 'pages',
    id: sermonPage.id,
    data: {
      layout: newLayout,
    },
  })

  console.log('✅ Successfully removed Rick Astley video from sermon page!')
  console.log('📋 Note: The page now has an empty YouTube section.')
  console.log('📋 Please add actual sermon videos via the CMS admin panel.')

  process.exit(0)
}

fixSermonPage().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
