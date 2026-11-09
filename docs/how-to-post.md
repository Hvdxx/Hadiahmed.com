# How to post on hadiahmed.com

You can post three ways. The editor is the easiest.

## 1. The editor (recommended)

1. Go to **hvdxx.github.io/Hadiahmed.com/admin** (or straight to **app.pagescms.org**). Once you connect your own domain, this becomes hadiahmed.com/admin.
2. Sign in with your GitHub account. The first time, it asks for permission to access your repositories. Allow it for `Hvdxx/Hadiahmed.com`.
3. Pick **Hvdxx/Hadiahmed.com**.
4. Click **Entries**, then **Add an entry**.
5. Fill in the form:
   - **Title:** the headline.
   - **Date:** when it happened or when you're posting.
   - **Type:** what kind of entry it is:
     - **Personal**: life, photos, places, things you care about
     - **Writing**: longer thoughts and things you're learning
     - **Project**: something you built or worked through
     - **Work**: a job or role
   - **Summary:** one or two sentences. They show on the home page and when someone shares the link.
   - **Main photo** (optional): upload a photo. It shows big at the top of the post, and on the home page while it's your newest entry.
   - **Photo description:** required whenever you add a photo. Describe what's in it, like "Me and the team outside the auditorium." Screen readers read this aloud to people who can't see the picture.
   - **Text:** write the post. You can use bold, links and lists.
6. Click **Save**. The site updates in about 2 minutes.

Your newest entry always shows up as the big "Latest" card on the home page, with its date, how long ago it was posted, and the reading time. All of that is worked out for you.

**Drafts:** turn on **Draft** to save something without publishing it. Turn it off when you're ready.

**Editing or deleting:** open **Entries**, click the entry, change it and click **Save**. To delete it, use the menu next to the entry.

**Changing your info:** **Site info** holds your intro paragraph, the tags under it, your contact details, experience, education and skills. **Photos** holds the photo page. Turn on "Show on home page" for the 4 photos you want in the home page grid.

**Tip:** for extra photos *inside* the text of a post, ask Claude, or use option 2 below. Main photos always work in the editor.

## 2. Directly on GitHub

1. Open the repository on github.com and go to `src/content/posts`.
2. Click **Add file → Create new file**.
3. Name it like `my-first-post.md` (lowercase, dashes instead of spaces).
4. Copy everything from [`docs/post-template.md`](post-template.md), paste it in, and change it.
5. Click **Commit changes**. The site updates in about 2 minutes.

## 3. Ask Claude

Paste what you want to say and tell Claude the type, for example: "post this as Writing, use the fountain photo." Claude writes the file and publishes it.

## If something goes wrong

Every update is checked before it goes live, for things like missing photo descriptions or accessibility problems. If a check fails, the site stays as it was, and GitHub emails you. Open the **Actions** tab on GitHub to see what failed, or ask Claude to fix it.
