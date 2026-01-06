#!/bin/bash

file=../frontend/src/urls.js

# get urls from aws ssm parameter store
capPhotoUri=$(aws ssm get-parameter --name "/fridge-log/capture-photo-api-url" --region us-east-1 | jq -r '.Parameter.Value')
emailExistenceUri=$(aws ssm get-parameter --name "/fridge-log/check-email-existence-api-url" --region us-east-1 | jq -r '.Parameter.Value')
deleteItemUri=$(aws ssm get-parameter --name "/fridge-log/delete-item-api-url" --region us-east-1 | jq -r '.Parameter.Value')
readFromDDBUri=$(aws ssm get-parameter --name "/fridge-log/get-items-api-url" --region us-east-1 | jq -r '.Parameter.Value')
writeToDDBUri=$(aws ssm get-parameter --name "/fridge-log/put-item-api-url" --region us-east-1 | jq -r '.Parameter.Value')

# create urls.js file
rm -rf $file
touch $file

# output urls to urls.js file
echo "const urls = {" >> $file
echo "  capturePhotoApiUrl: '$capPhotoUri'," >> $file
echo "  checkEmailExistenceApiUrl: '$emailExistenceUri'," >> $file
echo "  deleteItemApiUrl: '$deleteItemUri'," >> $file
echo "  readFromDDBUrl: '$readFromDDBUri'," >> $file
echo "  writeToDDBUrl: '$writeToDDBUri'" >> $file
echo "};" >> $file
echo "export default urls;" >> $file

# compile react app (optional)
case $1 in
    dev)
        cd ../frontend/src
        npm run dev
        ;;
    build)
        cd ../frontend/src
        npm run build
        ;;
    *)
        echo "No build option provided. Use 'dev' or 'build'."
        ;;
esac