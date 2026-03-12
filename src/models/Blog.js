import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: String,
  content: { type: String, required: true },
  image: String,
  author: { type: String, required: true },
  tags: [String],
  views: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

// Create slug from title
blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

export default mongoose.model('Blog', blogSchema);