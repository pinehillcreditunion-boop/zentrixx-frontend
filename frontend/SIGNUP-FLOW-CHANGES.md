# Signup flow update

- Replaced the old signup screen with a four-step carousel that stays on `/signup`.
- Signup collects name, email, password, phone number, government ID number, country, state/region and residential address.
- Email and phone verification are not required during signup.
- Successful signup creates a session and sends the user directly to `/dashboard`.
- Legacy email/phone verification and separate registration/photo routes now redirect to login or the dashboard.
- Added an identity setup card to the dashboard for uploading the government ID image and profile photo.
- Browser uploads use short-lived presigned S3 PUT URLs from the backend; AWS secret credentials are no longer needed in the frontend.
