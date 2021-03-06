# Update Canvas Pages

## Setup

```node
npm i -g byuitechops/update-canvas-pages
```

## Running the program

* This is meant to be run in two parts. 

    1. Download all pages from the course you want to edit
    2. Upload the pages you want to canvas

__Before both options you will have to verify your canvas API token__
```node
? What is your API Key?
```

### 1. Download course(s)

Downloads all of the pages from the course specified
```node
downloadCanvasPages
```

#### Then it will ask where to save the courses

* If the folder specified doesn't exist it will be created
* It defaults to Documents/courses
* Default will change based on input
* The course pages will be saved inside their own course folder titled `${course_name}-${course_ID}`

```node
? Where will the course to be saved? (C:\Users\${user}\Documents\courses)
```

#### Select the course to download with the course ID
```node
? ID of the course you want to download
```

#### Select if you want tags added to make it a full HTML page instead of a snippet.
Select your desired option with the arrow keys and space-bar. Press enter when selected
```node
? Do you want the full HTML for the page?
>( ) Yes
 ( ) No
 ```

### Only asks the next two questions if you answer 'Yes' to the full HTML

 #### Select if you want to include the ID for the course and pages in the names of folders and files
 ```node
 ? Do you want to include the ID in the folder and file names? 
>( ) Yes
  ( ) No
 ```

#### Select whether you want to remove the `Link` and `Script` tags from the pages
```node
? Do you want the Script and Link tags removed from the page?
>( ) Yes
 ( ) No
 ```

__You can then alter the page HTML however you want because it is saved on your local machine__

### 2. Upload pages

Updates specified pages to canvas
```node
updateCanvasPages
```

#### Asks where courses are located
Pulls default location from settings.json  
Default will change to whatever you input
```node 
? Where are your courses saved? (Documents/courses)
```

#### Chose what course(s) to select pages from (up/down arrows to hover over a course - space to select)
You can select multiple
```node 
? What course would you like to update?
```

#### Specify pages within course(s) to update (up/down arrows to hover over a course - space to select)
```node
? What pages to update from (1) FHGEN_130?
>( ) all
 ( ) none
 ────────
   [ ] (1) Course_Answer_Keys
   [ ] (2) Course_Homepage
   [ ] (3) FHGEN_Requirements
   [ ] (4) General_Lesson_Notes
   [ ] (5) Historical_Scripts
   [ ] (6) Italic_Alphabet
(Move up and down to reveal more choices)
```

__Once you select the pages and hit Enter it will update the pages on canvas regarless of errors. You can break a course if you're not careful. Please don't.__
