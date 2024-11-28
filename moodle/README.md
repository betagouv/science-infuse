# getting started
```
sudo tar --numeric-owner -xzf archive.tar.gz
docker compose up
```

## notes
This Moodle instance exposes web services that allow creating and exporting courses using the REST API. The web services are properly configured with the necessary permissions and protocols enabled to ensure secure API access.

All required plugins have been installed from the plugins folder into the Moodle instance. These plugins provide the additional capabilities needed by the web service to create and manage courses.

All the state of the moodle instance is stored in `archive.tar.gz` using the following command:

```
sudo tar --numeric-owner -czf archive.tar.gz data
```
If you want to update moodle settings and backup it's state efficiently using this method, you **need** to use a compression method that stores the user ID (UID) of the file owner (`--numeric-owner`) and the file permission. (this is what the command does. The sudo is needed because some db backup files are protected.)

We can commit the used passwords / tokens, since the service will not be publicly exposed.

**WARNING**: If you want to expose the Moodle service publicly, you must first:
- Revoke any existing tokens
- Delete the current API user
- Create a new API user with fresh credentials



---

## Setup moodle from scratch (advanced)

If for some reason (ie: new moodle version) you want to re-setup the moodle instance, this is the steps to follow:
1. Install all plugins:
    ```
    Site administration > Plugins > Install plugins
    1. Navigate to the plugins directory in this repository
    2. Install each .zip plugin file one by one
    
    Note: The source code for all plugins is available in this repository. You can modify or extend plugin functionality by editing the source code as needed (and zipping them back after editing)
    ```

2. First, enable Web Services:
   ```
   Site administration > General > Advanced features
   - Enable Web services (check the box)
   ```

3. Enable the REST protocol:
   ```
   Site administration > Server > Web services > Manage protocols
   - Enable REST protocol (check the box)
   ```

4. Create a custom web service:
   ```
   Site administration > Server > Web services > External services
   - Click "Add" to create a new service
   - Name it (e.g., "Course Creation Service")
   - Check "Enabled"
   - Check "Authorised users only"
   ```

5. Add required functions to the service:
   ```
   Click on "Functions" for your new service and add these functions:
    - core_course_create_courses
    - local_course_add_files_to_directory
    - local_course_add_new_course_module_book
    - local_course_add_new_course_module_directory
    - local_course_add_new_course_module_page
    - local_course_add_new_course_module_resource
    - local_course_add_new_course_module_url
    - local_course_add_new_section
    - local_course_delete_all_chapters_from_book
    - local_course_import_html_in_book
    - local_course_move_module_to_specific_position
    - local_course_save_attachment_in_assignment
    - local_course_save_attachment_in_label
    - local_course_save_attachment_in_lesson
    - local_course_save_attachment_in_lessonpage
    - local_course_save_attachment_in_page
    - local_course_update_course_module_assignment
    - local_course_update_course_module_label
    - local_course_update_course_module_lesson
    - local_course_update_course_module_lesson_contentpage
    - local_course_update_course_module_page
    - local_course_update_course_module_resource
    - local_wsmanagesections_create_sections
    - local_wsmanagesections_delete_sections
    - local_wsmanagesections_get_sections
    - local_wsmanagesections_move_section
    - local_wsmanagesections_update_sections
    - core_files_upload

   ```

6. Create a specific role for web services:
   ```
   Site administration > Users > Permissions > Define roles
   - Click "Add a new role"
   - Use role archetype: Manager
   - Add these capabilities:
     - moodle/course:create
     - moodle/course:update
     - moodle/course:manageactivities
     - webservice/rest:use
     ```

7. Assign the role to your user:
   ```
   Site administration > Users > Permissions > Assign system roles
   - Select your new web service role
   - Add your user
   ```

8. Add authorized user to the service:
   ```
   Site administration > Server > Web services > External services
   - Click on "Authorised users" for your service
   - Add your user
   ```

9. Create a new token:
   ```
   Site administration > Server > Web services > Manage tokens
   - Click "Add"
   - Select your user
   - Select your service
   - Save
   ```