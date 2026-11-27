# Dashboard direct-to-S3 image upload

The existing dashboard `IdentityDocuments` upload UI is retained. Its upload action now uses the same flow as the supplied JBank frontend: `ReactS3.uploadFile(file, config)`, require S3 response status `204`, then use `response.location` as the canonical image URL. The dashboard then sends that URL to the existing authenticated backend endpoints (`/registeration/:token` for `passportUrl`, `/pofilephoto/:token` for `profilePhotoUrl`), which save it in MongoDB.

No signup form or signup upload UI was added or changed. The dashboard is the upload surface.

## Frontend configuration

Copy `.env.example` to `.env` and fill in the five `REACT_APP_AWS_*` values. Restart the React dev server after changing environment variables. The `react-s3` dependency was already present in this project.

## AWS bucket CORS

Allow the deployed frontend origin to perform `PUT` requests to the bucket and expose the `ETag` response header as required by your bucket setup. Keep allowed origins restricted to your real app domains.

## Important security note

This is the exact browser-side credential pattern requested and used by the reference app. `REACT_APP_*` values are embedded in the public frontend bundle and are extractable by users. Use a dedicated IAM access key restricted to only the required bucket/prefix and `s3:PutObject`; do not reuse an administrator/root key. Rotate it if it has ever been exposed.
