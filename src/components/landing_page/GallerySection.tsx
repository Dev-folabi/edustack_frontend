"use client";
import Image from "next/image";
import { useState } from "react";
import { COLORS } from "@/constants/config";

export default function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const galleryImages = [
    {
      src: "https://ik.imagekit.io/edustack/edustack/Whisk_318bdc5300.jpg",
      alt: "Students in Science Lab",
      category: "academics",
    },
    {
      src: "https://ik.imagekit.io/edustack/edustack/Whisk_bc51572db5.jpg",
      alt: "Sports Day Event",
      category: "sports",
    },
    {
      src: "https://ik.imagekit.io/edustack/edustack/Whisk_175341d332.jpg",
      alt: "Art Exhibition",
      category: "arts",
    },
    {
      src: "https://ik.imagekit.io/edustack/edustack/Whisk_b4c101128a.jpg",
      alt: "Library Study Session",
      category: "academics",
    },
    {
      src: "https://ik.imagekit.io/edustack/edustack/Whisk_28fb972d05.jpg",
      alt: "Drama Performance",
      category: "arts",
    },
    {
      src: "https://ik.imagekit.io/edustack/edustack/Whisk_ef291e6557.jpg",
      alt: "Basketball Tournament",
      category: "sports",
    },
    {
      src: "https://ik.imagekit.io/edustack/edustack/Whisk_c3c993054c.jpg",
      alt: "Graduation Ceremony",
      category: "events",
    },
    {
      src: "https://ik.imagekit.io/edustack/edustack/Whisk_3648c705fa.jpg",
      alt: "Music Concert",
      category: "arts",
    },
    {
      src: "https://ik.imagekit.io/edustack/edustack/Whisk_351bd2c281.jpg",
      alt: "Science Fair",
      category: "academics",
    },
    {
      src: "https://ik.imagekit.io/edustack/edustack/Whisk_afef28a9a9.jpg",
      alt: "Field Trip",
      category: "events",
    },
    {
      src: "https://ik.imagekit.io/edustack/edustack/Whisk_11ea24ff91.jpg",
      alt: "Computer Lab",
      category: "academics",
    },
    {
      src: "https://ik.imagekit.io/edustack/edustack/Whisk_1ffd272311.jpg",
      alt: "Annual Day Celebration",
      category: "events",
    },
  ];

  const [filter, setFilter] = useState("all");
  const categories = ["all", "academics", "sports", "arts", "events"];

  const filteredImages =
    filter === "all"
      ? galleryImages
      : galleryImages.filter((img) => img.category === filter);

  return (
    <section
      id="gallery"
      className="py-20"
      style={{ backgroundColor: COLORS.background.accent }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: COLORS.primary[700] }}
          >
            Gallery
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore moments from our vibrant school community.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                filter === category
                  ? "text-white shadow-lg"
                  : "text-gray-600 bg-white hover:bg-gray-50"
              }`}
              style={{
                backgroundColor:
                  filter === category ? COLORS.primary[500] : undefined,
              }}
              onClick={() => setFilter(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image, index) => (
            <div
              key={index}
              className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              onClick={() => setSelectedImage(image.src)}
            >
              <div className="relative w-full h-64">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  priority={index < 4}
                />
              </div>
              <div className="absolute inset-0 bg-black/35 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🔍</div>
                    <p className="text-sm font-medium">{image.alt}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for enlarged image */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <Image
                src={selectedImage}
                width={1200}
                height={800}
                alt="Enlarged view"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
