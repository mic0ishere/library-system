import joi from "joi/lib";

export const bookSchema = joi.object({
    title: joi.string().max(256).messages({
        "string.empty": "Title is required",
        "string.max": "Title cannot be longer than 256 characters"
    }),
    author: joi.string().max(256).messages({
        "string.empty": "Author name is required",
        "string.max": "Author name cannot be longer than 256 characters"
    }),
    year: joi.string().max(64).messages({
        "string.empty": "Publishing year is required",
        "string.max": "Publishing year cannot be longer than 64 characters"
    }),
    pages: joi.number().integer().min(1).messages({
        "number.base": "Pages count must be a number",
        "number.min": "Pages count cannot be lower than 1"
    }),
    isbn: joi.string().min(10).max(13).pattern(/^\d+$/).messages({
        "string.empty": "ISBN is required",
        "string.min": "ISBN must be at least 10 characters long",
        "string.max": "ISBN cannot be longer than 13 characters",
        "string.pattern.base": "ISBN is invalid"
    })
})