# Gororobas, an agroecology wiki for EdgeDB's hackathon

![Screenshot of the app](./public/default-og.png)

✨ The app is live at: https://gororobas.com

This is a Typescript project built leveraging the following technologies:

- [EdgeDB](https://edgedb.com): database and authentication
- [NextJS](https://nextjs.org) and [React](https://react.dev/): frontend frameworks
- [Vercel](https://vercel.com): deployment
- [TailwindCSS](https://tailwindcss.com), [RadixUI](https://www.radix-ui.com/) and [Shadcn/UI](https://ui.shadcn.com/): styling and component primitives
- [Effect](https://effect.website): typescript tooling for more robust and type-safe code
- [OpenTelemetry](https://opentelemetry.io) and [Honeycomb](https://honeycomb.io): observability
- [Sanity.io](https://sanity.io): image storage and CDN
- [Mailpit](https://mailpit.axllent.org/docs/install/): email server for local development
- [Tiptap](https://tiptap.dev): rich text editor
- [react-hook-form](https://react-hook-form.com): form state management
- [dnd-kit](https://dndkit.com): drag and drop for lists in form
- [pnpm](https://pnpm.io): package manager
- [Biome](https://biomejs.dev): linter and prettifier
- [lint-staged](https://github.com/lint-staged/lint-staged) and [husky](https://typicode.github.io/husky/): pre-commit hooks to ensure everything is OK
- [Bun](https://bun.sh): Javascript runtime for faster local development

## Introduction to the project

![Screenshot of the app](./public/presentation-peek.png)

You can learn about the project's motivation, tech stack, approach and learnings here: https://hdoro.mmm.page/edgedb-hackathon

## Developing locally

1. Start by populating the `.env.example` file with the necessary environment variables. You can copy it to `.env.local` and fill in the values.
    - If you're connected to the Vercel project, you can use `vercel env pull` to build the production `.env` file.
1. In order to authenticate with emails locally, you need to install and run [Mailpit](https://mailpit.axllent.org/docs/install/). This will allow the EdgeDB server to send emails via your local Mailpit server.
    - 💡 You can still authenticate with Google oAuth without it
1. To connect to a local database, [install EdgeDB](https://docs.edgedb.com/get-started/quickstart#installation) to your machine
1. Run `pnpm install` to install the dependencies
1. In a separate terminal, run `edgedb ui` to open the EdgeDB Studio
1. Then, in the same EdgeDB terminal, run `edgedb watch` to have it watch changes to your schema
1. After EdgeDB has applied the necessary migrations, run `bun run generate:all` to have the types and our custom EdgeQL SDK generated. This is necessary to interact with the database and the project won't run without it.
1. After generating types, run `bun run auth:setup` to configure EdgeDB with the proper authentication settings
1. Finally, run `bun run dev` to start the development server and access the app at `http://localhost:3000`

## Deploying the app and database

1. Log into EdgeDB Cloud in your terminal with `edgedb cloud login`
1. Migrate the current database schema to the cloud with `edgedb migrate -I ORG/INSTANCE_NAME`
1. If you're starting a new cloud instance, you can seed it with a local dump of data with:
    ```sh
    edgedb dump <your-dump.dump>
    edgedb restore -I <org>/<instance-name> <your-dump.dump>
    ```
1. If you're setting up a Vercel project for it the first time, refer to the [official guide on deploying to Vercel](https://docs.edgedb.com/guides/tutorials/nextjs_app_router#deploying-to-vercel)
1. When you push a commit to main, Vercel will automatically build and deploy it to `gororobas.com` or whatever the domain for the new project you've set up

## Credits

People involved in this creation:

- [henrique doro](https://hdoro.dev) - design and development
- [angie cepeda](https://www.instagram.com/angiedeandes/) - content and photography
- Daniel Mundim Porto Pena - for his work on [Sistematização e planejamento de sistemas agroflorestais no bioma Cerrado](https://repositorio.ufu.br/handle/123456789/30942), which we used to populate a subset of the database

## License

This project is licensed under the Apache 2.0 License. You can read more about it in the [LICENSE](./LICENSE) file.

## TODOs

### Vegetable form

- [x] Finish form
  - [x] Editing tips
  - [x] Select & query friends of a vegetable
  - [x] (SourceInput) move to array and allow selecting users
    - Update createVegetables to insert sources
    - Update migration to insert sources
    - Update migration to include root vegetable sources
- [ ] Fix validation (sources, photo)

### User Authentication

- [x] Login & sign-up forms - done by EdgeDB?
- [x] Auth emails - done by EdgeDB?
- [x] Admin & regular roles
- [x] If session but no User/UserProfile (failed the auth callback), create
  - Probably do so in HeaderNav, where we fetch the profile?
- [x] Google authentication
- [ ] Debug faulty redirect on login (signups working fine)

### Vegetable submission

- [x] EdgeDB schema
- [x] Server action
- [x] Encode form value to EdgeDB schema
- [ ] ~~OrderIndex for Tips, Varieties and Photos~~ - blocked by a bug with edgeql-js (see #stretch)
- [x] Upload images to Sanity
- [x] Send to server, error handling, state management, etc.

### Editing existing vegetable

- [ ] Parametrize vegetable form
- [ ] Decode EdgeDB schema to form value
- [ ] Update vegetable in DB (need to calculate diffs et. al)
- [ ] EditSuggestion
  - Diffing for Vegetable before/after
  - Apply diff to vegetable, keep user as author in Auditable
  - Admin UI to view and accept diffs

### Vegetable page

- [x] Update wishlist
- [x] Sidebar
- [x] Query all users that have wishlisted to display on vegetable page
- [x] Render sources
- [x] Render associated notes
- [ ] Photos carousel dialog
- [ ] Tips carousel dialog

### Edit user profile

- [x] /perfil route
- [x] Small form with:
  - Name
  - Profile picture
  - Location
  - Bio
- [x] Diffing & mutation to edit profile

### Homepage

- [x] Design
- [x] Vegetables grid
- [x] People strip
- [x] Notes grid
- [x] CTA to join & contribute

### Unstructured

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
- [x] 404 page
- [x] Move Shadcn components to tailwind-variants
- [x] Empty state in UserProfile to submit their notes
- [ ] Fix bug with hiding footer after loading NoteForm (CSS file doesn't get unloaded by Next) 
- [x] Section inviting users to contribute

### Notes

- [x] Migrate notes from Roam to EdgeDB
- [x] Note card
- [x] Note page
- [x] Notes grid
- [x] Send note
  - [x] Rich text editor
- [x] Delete note
- [x] Notes index
- [x] Query and render related notes
- [x] Query and render related vegetables

## AI

- [ ] Relate notes to vegetables (note creation/update trigger)
- [ ] Relate notes to suggestions and tips (note creation/update trigger)
- [ ] Relate suggestions and tips to notes (tip creation/update trigger)

## Deployment

- [x] Honeycomb
- [x] Create EdgeDB Cloud instance
- [x] Set-up backups - automatically provided by EdgeDB Cloud
- [x] Migrate schemas to cloud instance
- [x] Migrate data
  - Couve, Café e Cupuaçu tavam falhando
- [x] Publish on Vercel
- [x] Documentation

## Stretch

- [ ] Comments in tips
- [ ] Better HeaderNav styles on mobile
- [x] User profile page
  - Profile picture
  - Bio
  - Social links
  - Contributions
- [ ] Better form errors (especially photos, varieties and tips)
- [ ] Debug why SanityImage is re-rendering so much in ProfileForm
- [ ] ProfileForm: don't allow duplicate handles
- [ ] Set-up DB branches in Github Actions
- [ ] Exclusivity constraint on source's URL, with `unlessConflict` on mutation and de-duplication in `createVegetable`
- [ ] Dynamic OG Images
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
- [ ] Fix `@order_index` not being accepted by edgeql-js
    ```
    Failed creating vegetable QueryError: invalid reference to link property in top level shape
    |       single @order_index := __forVar__0.order_index
    ```
    - Happened with `edgedb@/1.6.0-canary.20240510T201054` and `@edgedb/generate@0.6.0-canary.20240510T202700` as well as the latest `@edgedb/generate@0.5.3`
    - tried renaming to just `order`, also didn't work
- Learn from Michael: https://github.com/mikearnaldi/next-effect/blob/main/app/page.tsx
- [ ] NoteForm: Allow modifying `published_at`
- [ ] Edit note - for now, it's a Twitter like thing where you can only send/delete, no edit 😝
- [ ] RichTextEditor: internal links to other objects WithHandle
- [ ] Form validation: can we validate the encoded schema instead of fully decoding it? It'd make it slightly faster with images not needing to be processed.