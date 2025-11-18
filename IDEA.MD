# Summary
NutritionOCR will be a PWA and potentially mobile app you can you use to track things you've eaten. Ideally you point your camera at a product, and we use OCR to read the Nutrition Facts label and save them in IndexedDB. You can then see a sum for common facts like Calories, Sodium, Protein, per day.

# Components
 - React Native: Used to create the cross platform web app + mobile.
 - React Native Paper: Component library for styling UI.
 - OCR: Tesseract.js to retrieve characters from images.
 - Typescript: For safe type handling.

# Nutrition Tracking
For each scanned product, we should save all text, but aggregate the following for all products across each day:
 - Calories
 - Total Fat
 - Sodium
 - Total Carb.
 - Total Sugars
 - Incl. Added Sugars
 - Protein

Anything extra is great, but those are the important ones.

# User Flow

## Add Nutrition Fact
1) On the home page where previous items are listed, user clicks an "Add Item" button.
2) User opens their camera and takes a photo of a Nutrition Facts label.
3) OCR is run on the photo, is nothing or not enough is found, a error is given to the user to improve the lighting or angle.
4) The parsed data is filled into a blank Nutrition Facts label underneath the photo, the user has the opportunity to edit it to make sure they match.
5) The user hits a "Save" button to add it to IndexedDB.
6) The user is returned to the home page with a list of saved items, sorted by date and time added.

## View Day Summary
1) On the home page where previous items are listed, user clicks on a "Summary" icon next to each day header. Note that items are sorted by time added and day added, and the day headers should have the date on the left, "Summary" icon button on the right.
2) The user is taken to the Summary page for the day they interfaced with, where the aggregate totals are listed for all the items they added for that day. Below the aggregate totals should be a list of the items the aggregates were based on.

## Edit or Delete Items
1) On the home page where previous items are listed, user can click on the item to see the item details page.
2) On the item details page, all the items details are listed out. There is also an "Edit" and "Delete" button.
3) The "Edit" button allows the user to update and change any fields in the item and "Update" them.
4) The "Delete" button allows the user to delete the item from the list and IndexedDB and update any aggregate counts.


