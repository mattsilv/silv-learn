/**
 * TODO: Update this component to use your client-side framework's link
 * component. We've provided examples of how to do this for Next.js, Remix, and
 * Inertia.js in the Catalyst documentation:
 *
 * https://catalyst.tailwindui.com/docs#client-side-router-integration
 */

import * as Headless from '@headlessui/react'
import React, { forwardRef } from 'react'
import { Link as RouterLink, type LinkProps } from 'react-router-dom'

export const Link = forwardRef(function Link(
  props: Omit<LinkProps, 'to'> & { href: string } & React.ComponentPropsWithoutRef<'a'>,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  const { href, ...rest } = props
  return (
    <Headless.DataInteractive>
      <RouterLink to={href} {...rest} ref={ref} />
    </Headless.DataInteractive>
  )
})
