## napk.in

VeryWIP

## todo

- encrypt only content, not metadata (version, date?) of the payload
- have the persistance BE reject the request if version is older than the one stored
  - the FE should inform user of the difference, recommend refreshing the page to pull the new version
- allow to set the title of the note, set it to <title>, store in Store
  - can use this to support "multiple notes" without actually trying, just create a new one, add it to bookmarks, sorted
- do not save unmodified notes
- figure out why we request the data twice (hoot called twice)
