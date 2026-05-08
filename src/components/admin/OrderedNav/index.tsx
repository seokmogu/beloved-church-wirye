import { DefaultNavClient, NavHamburger, NavWrapper } from '@payloadcms/next/client'
import { Logout } from '@payloadcms/ui'
import { RenderServerComponent } from '@payloadcms/ui/elements/RenderServerComponent'
import { EntityType, groupNavItems, type EntityToGroup } from '@payloadcms/ui/shared'
import { cache } from 'react'
import type { NavPreferences, PayloadRequest, ServerProps } from 'payload'
import { PREFERENCE_KEYS } from 'payload/shared'

const baseClass = 'nav'
const defaultNavPreferences: NavPreferences = { groups: {}, open: true }
type OrderedNavProps = { req?: PayloadRequest } & ServerProps

const getNavPrefs = cache(async (req?: PayloadRequest): Promise<NavPreferences | null> => {
  if (!req?.user?.collection) return null

  return req.payload
    .find({
      collection: 'payload-preferences',
      depth: 0,
      limit: 1,
      pagination: false,
      req,
      where: {
        and: [
          { key: { equals: PREFERENCE_KEYS.NAV } },
          { 'user.relationTo': { equals: req.user.collection } },
          { 'user.value': { equals: req.user.id } },
        ],
      },
    })
    .then((res) => (res?.docs?.[0]?.value as NavPreferences | undefined) ?? null)
})

function getGroupOrder(label: string): number {
  const order = label.match(/^(\d+)\./)?.[1]
  return order ? Number(order) : Number.MAX_SAFE_INTEGER
}

function sortNavGroups(groups: ReturnType<typeof groupNavItems>) {
  return [...groups].sort((a, b) => {
    const orderDiff = getGroupOrder(a.label) - getGroupOrder(b.label)
    if (orderDiff !== 0) return orderDiff

    return a.label.localeCompare(b.label, 'ko')
  })
}

export async function OrderedNav(props: OrderedNavProps) {
  const {
    documentSubViewType,
    i18n,
    locale,
    params,
    payload,
    permissions,
    req,
    searchParams,
    user,
    viewType,
    visibleEntities,
  } = props

  if (!payload?.config || !permissions) return null

  const {
    admin: {
      components: { afterNav, afterNavLinks, beforeNav, beforeNavLinks, logout },
    },
    collections,
    globals,
  } = payload.config

  const entities: EntityToGroup[] = [
    ...collections
      .filter(({ slug }) => visibleEntities?.collections?.includes(slug))
      .map((collection) => ({
        entity: collection,
        type: EntityType.collection as const,
      })),
    ...globals
      .filter(({ slug }) => visibleEntities?.globals?.includes(slug))
      .map((global) => ({
        entity: global,
        type: EntityType.global as const,
      })),
  ]

  const groups = sortNavGroups(groupNavItems(entities, permissions, i18n))
  const navPreferences = (await getNavPrefs(req)) ?? defaultNavPreferences
  const sharedServerProps = {
    i18n,
    locale,
    params,
    payload,
    permissions,
    searchParams,
    user,
  }
  const sharedClientProps = {
    documentSubViewType,
    viewType,
  }

  const LogoutComponent = RenderServerComponent({
    clientProps: sharedClientProps,
    Component: logout?.Button,
    Fallback: Logout,
    importMap: payload.importMap,
    serverProps: sharedServerProps,
  })

  const RenderedBeforeNav = RenderServerComponent({
    clientProps: sharedClientProps,
    Component: beforeNav,
    importMap: payload.importMap,
    serverProps: sharedServerProps,
  })
  const RenderedBeforeNavLinks = RenderServerComponent({
    clientProps: sharedClientProps,
    Component: beforeNavLinks,
    importMap: payload.importMap,
    serverProps: sharedServerProps,
  })
  const RenderedAfterNavLinks = RenderServerComponent({
    clientProps: sharedClientProps,
    Component: afterNavLinks,
    importMap: payload.importMap,
    serverProps: sharedServerProps,
  })
  const RenderedAfterNav = RenderServerComponent({
    clientProps: sharedClientProps,
    Component: afterNav,
    importMap: payload.importMap,
    serverProps: sharedServerProps,
  })

  return (
    <NavWrapper baseClass={baseClass}>
      {RenderedBeforeNav}
      <nav className={`${baseClass}__wrap`}>
        {RenderedBeforeNavLinks}
        <DefaultNavClient groups={groups} navPreferences={navPreferences} />
        {RenderedAfterNavLinks}
        <div className={`${baseClass}__controls`}>{LogoutComponent}</div>
      </nav>
      {RenderedAfterNav}
      <div className={`${baseClass}__header`}>
        <div className={`${baseClass}__header-content`}>
          <NavHamburger baseClass={baseClass} />
        </div>
      </div>
    </NavWrapper>
  )
}
