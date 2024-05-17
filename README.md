# Agroecology wiki for EdgeDB's hackathon

Documentation is WIP

## Vegetable form

- [ ] Finish form
  - [x] Editing tips
  - [x] Select & query friends of a vegetable
  - [ ] (SourceInput) move to array and allow selecting users


## User Authentication

- [x] Login & sign-up forms - done by EdgeDB?
- [x] Auth emails - done by EdgeDB?
- [x] Admin & regular roles
- [ ] If session but no User/UserProfile (failed the auth callback), create

## Vegetable submission

- [x] EdgeDB schema
- [x] Server action
- [x] Encode form value to EdgeDB schema
- [ ] Upload images to Sanity
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
- [ ] Photos carousel dialog
- [ ] Tips carousel dialog
- [ ] Query all users that have wishlisted to display on vegetable page

## Homepage

- [ ] Vegetables grid
- [ ] Design
- [ ] Rendering

## AI

- [ ] Relate notes to vegetables (note creation/update trigger)
- [ ] Relate notes to suggestions and tips (note creation/update trigger)
- [ ] Relate suggestions and tips to notes (tip creation/update trigger)

## Unstructured

- [x] BiomeJS?
- [x] Migrate data from Sanity
- [ ] Consider skipping on notes for now
  - If so, is there an eye-catching way of using AI and RAG?
- [ ] User profile
  - Profile picture
  - Bio
  - Social links
  - Contributions
- [ ] More personality to theme (v0 theme generator?)

## Deployment

- [ ] Put on EdgeDB Cloud
- [ ] Migrate data
- [ ] Set-up backups
- [ ] Publish on Vercel
- [ ] Set-up DB branches in Github Actions

## Stretch

- [ ] Move Shadcn components to tailwind-variants
- [ ] Comments in tips
- [ ] Streams timelapse
- [ ] Blog posts
  - How to add complex objects to EdgeDB via transactions
  - Using Effect Schema to solve forms' validation and encoding/decoding
- [ ] Landing page about the project
  - Commit history, visualized
  - numbers: X hours of stream, Y commits, Z days
- [ ] Image hotspotting and cropping

### Notes

- [ ] Rich text editor
- [ ] Send note
- [ ] Display notes in Vegetable page
- [ ] Migrate notes from Roam to EdgeDB
- [ ] Notes grid
- [ ] Note page