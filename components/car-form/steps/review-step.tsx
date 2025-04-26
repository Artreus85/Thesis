import Image from "next/image"
import type { CarFormValues } from "../car-form"

interface ReviewStepProps {
  formValues: CarFormValues
  images: File[]
  existingImages: string[]
}

export function ReviewStep({ formValues, images, existingImages }: ReviewStepProps) {
  const formatValue = (value: string | undefined) => {
    return value || "Не е посочено"
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Преглед на обявата</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Моля, прегледайте внимателно информацията за вашия автомобил преди да публикувате обявата.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-md font-medium mb-3 pb-2 border-b">Основна информация</h4>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="font-medium text-muted-foreground">Марка:</dt>
            <dd>{formatValue(formValues.brand)}</dd>

            <dt className="font-medium text-muted-foreground">Модел:</dt>
            <dd>{formatValue(formValues.model)}</dd>

            <dt className="font-medium text-muted-foreground">Година:</dt>
            <dd>{formatValue(formValues.year)}</dd>

            <dt className="font-medium text-muted-foreground">Състояние:</dt>
            <dd>{formatValue(formValues.condition)}</dd>

            <dt className="font-medium text-muted-foreground">Цена:</dt>
            <dd>{formValues.price ? `${formValues.price} лв.` : "Не е посочена"}</dd>
          </dl>
        </div>

        <div>
          <h4 className="text-md font-medium mb-3 pb-2 border-b">Технически данни</h4>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="font-medium text-muted-foreground">Пробег:</dt>
            <dd>{formValues.mileage ? `${formValues.mileage} км` : "Не е посочен"}</dd>

            <dt className="font-medium text-muted-foreground">Гориво:</dt>
            <dd>{formatValue(formValues.fuel)}</dd>

            <dt className="font-medium text-muted-foreground">Скорости:</dt>
            <dd>{formatValue(formValues.gearbox)}</dd>

            <dt className="font-medium text-muted-foreground">Мощност:</dt>
            <dd>{formValues.power ? `${formValues.power} к.с.` : "Не е посочена"}</dd>

            <dt className="font-medium text-muted-foreground">Купе:</dt>
            <dd>{formatValue(formValues.bodyType)}</dd>

            <dt className="font-medium text-muted-foreground">Задвижване:</dt>
            <dd>{formatValue(formValues.driveType)}</dd>

            <dt className="font-medium text-muted-foreground">Цвят:</dt>
            <dd>{formatValue(formValues.color)}</dd>

            <dt className="font-medium text-muted-foreground">Врати/Места:</dt>
            <dd>
              {formValues.doors} / {formValues.seats}
            </dd>

            <dt className="font-medium text-muted-foreground">Обем двигател:</dt>
            <dd>{formValues.engineSize ? `${formValues.engineSize} л` : "Не е посочен"}</dd>
          </dl>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium mb-3 pb-2 border-b">Описание и екстри</h4>
        <div className="space-y-4">
          <div>
            <h5 className="text-sm font-medium text-muted-foreground mb-1">Описание:</h5>
            <p className="text-sm whitespace-pre-line">{formValues.description || "Няма описание"}</p>
          </div>

          {formValues.features && (
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-1">Екстри:</h5>
              <ul className="list-disc list-inside text-sm">
                {formValues.features.split(",").map((feature, index) => (
                  <li key={index}>{feature.trim()}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium mb-3 pb-2 border-b">Снимки</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {existingImages.map((src, index) => (
            <div key={`existing-${index}`} className="relative aspect-video rounded-md overflow-hidden border">
              <Image
                src={src || "/placeholder.svg"}
                alt={`Снимка ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}

          {images.map((file, index) => (
            <div key={`new-${index}`} className="relative aspect-video rounded-md overflow-hidden border">
              <Image
                src={URL.createObjectURL(file) || "/placeholder.svg"}
                alt={`Нова снимка ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}

          {existingImages.length === 0 && images.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">Няма добавени снимки</p>
          )}
        </div>
      </div>
    </div>
  )
}
