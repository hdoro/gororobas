# Agroecology wiki for EdgeDB's hackathon

Documentation is WIP

## Vegetable form

- [x] Finish form
  - [x] Editing tips
  - [x] Select & query friends of a vegetable
  - [x] (SourceInput) move to array and allow selecting users
    - Update createVegetables to insert sources
    - Update migration to insert sources
    - Update migration to include root vegetable sources

## User Authentication

- [x] Login & sign-up forms - done by EdgeDB?
- [x] Auth emails - done by EdgeDB?
- [x] Admin & regular roles
- [ ] If session but no User/UserProfile (failed the auth callback), create
  - Probably do so in HeaderNav, where we fetch the profile?

## Vegetable submission

- [x] EdgeDB schema
- [x] Server action
- [x] Encode form value to EdgeDB schema
- [ ] ~~OrderIndex for Tips, Varieties and Photos~~ - blocked by a bug with edgeql-js (see #stretch)
- [x] Upload images to Sanity
- [ ] Send to server, error handling, state management, etc.

## Editing existing vegetable

- [ ] Parametrize vegetable form
- [ ] Decode EdgeDB schema to form value
- [ ] Update vegetable in DB (need to calculate diffs et. al)
- [ ] EditSuggestion
  - Diffing for Vegetable before/after
  - Apply diff to vegetable, keep user as author in Auditable
  - Admin UI to view and accept diffs

## Vegetable page

- [x] Update wishlist
- [x] Sidebar
- [x] Query all users that have wishlisted to display on vegetable page
- [ ] Photos carousel dialog
- [ ] Tips carousel dialog
- [ ] Notes

## Edit user profile

- [x] /perfil route
- [x] Small form with:
  - Name
  - Profile picture
  - Location
  - Bio
- [x] Diffing & mutation to edit profile

## Homepage

- [x] Design
- [x] Vegetables grid
- [x] People strip
- [ ] Notes grid


## Unstructured

- [x] BiomeJS?
- [x] Migrate data from Sanity
- [x] OpenTelemetry
- [x] Fix access control on User and UserProfile - non-admins can't access their `global_user_profile`
  - Partial fix was to remove access control on User
- [x] Consider skipping on notes for now
  - If so, is there an eye-catching way of using AI and RAG?
  - Won't skip, let's stretch!
- [x] Footer
- [x] HeaderNav
- [x] More personality to theme
    - ~~v0 theme generator?~~ had to do manually, wasn't out at this moment

### Notes

- [ ] Rich text editor
- [ ] Send note
- [ ] Display notes in Vegetable page
- [ ] Migrate notes from Roam to EdgeDB
- [ ] Notes grid
- [ ] Note page

## AI

- [ ] Relate notes to vegetables (note creation/update trigger)
- [ ] Relate notes to suggestions and tips (note creation/update trigger)
- [ ] Relate suggestions and tips to notes (tip creation/update trigger)

## Deployment

- [ ] Put on EdgeDB Cloud
- [ ] Migrate data
- [ ] Honeycomb
- [ ] Set-up backups
- [ ] Publish on Vercel
- [ ] Set-up DB branches in Github Actions
- [ ] Documentation

## Stretch

- [ ] Better HeaderNav styles on mobile
- [ ] User profile page
  - Profile picture
  - Bio
  - Social links
  - Contributions
- [ ] Better form errors (especially photos, varieties and tips)
- [ ] Debug why SanityImage is re-rendering so much in ProfileForm
- [ ] ProfileForm: don't allow duplicate handles
- [ ] Exclusivity constraint on source's URL, with `unlessConflict` on mutation and de-duplication in `createVegetable`
- [ ] Move Shadcn components to tailwind-variants
- [ ] Comments in tips
- [ ] Test React 19
- [ ] Streams timelapse
- [ ] Blog posts
  - How to add complex objects to EdgeDB via transactions
  - Using Effect Schema to solve forms' validation and encoding/decoding
- [ ] Landing page about the project
  - Commit history, visualized
  - numbers: X hours of stream, Y commits, Z days
- [ ] Image hotspotting and cropping
- [ ] Shadow routes for vegetable page (open in dialog if in vegetables grid)
- [ ] 404 page
- [ ] Fix `@order_index` not being accepted by edgeql-js
    ```
    Failed creating vegetable QueryError: invalid reference to link property in top level shape
    |       single @order_index := __forVar__0.order_index
    ```
    - Happened with `edgedb@/1.6.0-canary.20240510T201054` and `@edgedb/generate@0.6.0-canary.20240510T202700` as well as the latest `@edgedb/generate@0.5.3`
    - tried renaming to just `order`, also didn't work
- Learn from Michael: https://github.com/mikearnaldi/next-effect/blob/main/app/page.tsx
