import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ContentBlock } from '@/blocks/Content/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { YouTubeBlockComponent } from '@/blocks/YouTubeBlock/Component'
import { InstagramBlockComponent } from '@/blocks/InstagramBlock/Component'
import { ScheduleBlockComponent } from '@/blocks/ScheduleBlock/Component'
import { GoogleDriveBlockComponent } from '@/blocks/GoogleDriveBlock/Component'
import { OfferingBlockComponent } from '@/blocks/OfferingBlock/Component'
import { BulletinsBlockComponent } from '@/blocks/BulletinsBlock/Component'
import { AnnouncementsBlockComponent } from '@/blocks/AnnouncementsBlock/Component'

const blockComponents: Record<string, React.FC<any>> = {
  content: ContentBlock,
  mediaBlock: MediaBlock,
  youtubeBlock: YouTubeBlockComponent,
  instagramBlock: InstagramBlockComponent,
  scheduleBlock: ScheduleBlockComponent,
  googleDriveBlock: GoogleDriveBlockComponent,
  offeringBlock: OfferingBlockComponent,
  bulletinsBlock: BulletinsBlockComponent,
  announcementsBlock: AnnouncementsBlockComponent,
}

export const RenderBlocks: React.FC<{
  blocks: any[]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className="my-16" key={index}>
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
