import { vl } from "moondream"

const model = new vl({
    apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlfaWQiOiI2MmVkYWEyYS00NWRhLTQzMzItYjAzNC02YmI2MzhkNjljMTAiLCJvcmdfaWQiOiI0b0xDdGJhUmhBeml5WVdNWTlBNjBHZmw0VUpybFdpNSIsImlhdCI6MTc2NzAzNzk1MywidmVyIjoxfQ.tqcVtGG9TuYgvROZ8QhgTzr8aLhdSGaZIBMgxsWr3ZY"
})

export const handler = async (event) =>
{
    console.log('entering capture photo lambda function')

    const body = typeof (event.body) === 'string' ? JSON.parse(event.body) : event.body

    let img = body?.base64Image || "" //image is a base64 encoded string
    if (img.startsWith("data:image")) img = img.split(",")[1] // removes the "data:image/*" part AKA MIME prefix
    img = Buffer.from(img, "base64")

    try {
        console.log('trying to query moondream')

        const response = await model.query({
            image: img,
            question: "What is the expiry date on this object? Give me the date in USA format (MM/DD/YYYY)."
        })

        console.log('response:', JSON.stringify(response))

        return {
            statusCode: 200,
            body: JSON.stringify(response),
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*", // Allow from anywhere 
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            }
        }
    } catch (e) {
        console.error('error in capture photo lambda function!', e)

        return {
            statusCode: 500,
            body: JSON.stringify(e),
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*", // Allow from anywhere 
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            }
        }
    }
}