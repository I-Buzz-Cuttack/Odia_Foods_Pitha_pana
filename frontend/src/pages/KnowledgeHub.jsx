import { BookOpen, Flame, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios";

const fallbackPosts = [
  {
    id: 1,
    title: "Why Pithas Matter in Odia Festivals",
    excerpt: "Pithas carry stories of harvest, family rituals, and temple culture.",
    content: "Raja, Prathamastami, Manabasa Gurubar, Rath Yatra, and Pana Sankranti each bring their own food memories.",
    category: "Culture"
  }
];

export default function KnowledgeHub() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get("/knowledge").then(({ data }) => setPosts(data)).catch(() => setPosts(fallbackPosts));
  }, []);

  return (
    <section className="container-page py-12">
      <div className="max-w-3xl">
        <p className="font-semibold uppercase tracking-[0.2em] text-clay">Knowledge Hub</p>
        <h1 className="section-title mt-2">Odisha Food Stories, Recipes and Heritage</h1>
        <p className="mt-4 text-lg leading-8 text-ink/70">
          Learn the history, ritual meaning, traditional cooking methods, storage guidance, and food stories behind Odisha's Pithas and Panas.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {[
          [BookOpen, "History", "Food memories from temples, harvest cycles, and Odia households."],
          [Utensils, "Cooking Methods", "Steaming in turmeric leaves, slow baking, tawa cooking, and jaggery work."],
          [Flame, "Festival Significance", "Raja, Rath Yatra, Makar Sankranti, Manabasa Gurubar, and more."]
        ].map(([Icon, title, text]) => (
          <div key={title} className="rounded-lg border border-temple/10 bg-white p-6 shadow-sm">
            <Icon className="text-sindoor" />
            <h2 className="mt-4 font-display text-2xl font-bold text-temple">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/70">{text}</p>
          </div>
        ))}
      </div>

            <div className="mt-14 rounded-2xl border border-sindoor/20 bg-gradient-to-b from-haldi/10 to-white p-8 shadow-sm md:p-10">
        <p className="font-semibold uppercase tracking-[0.2em] text-clay">Sacred Craft</p>
        <h2 className="section-title mt-2">Made in the Temple: Purity, Hygiene & Spiritual Devotion</h2>

        <div className="mt-6 space-y-5 text-ink/80">
          <p className="leading-8">
            Every Pitha and Pana that reaches your home begins its journey inside the temple kitchen, a space where
            cooking itself is treated as an act of worship. Long before the first grain of rice is soaked, the
            kitchen is cleansed with water and cow dung, the hearths are lit with sacred fire, and the cooks bathe
            and dress in fresh, unstitched cotton cloth as a mark of purity. Nothing is tasted before it is offered;
            the first portion of every preparation belongs to the deity alone.
          </p>
          <p className="leading-8">
            Hygiene in the temple kitchen is not a modern checklist, it is centuries of ritual discipline. Rice and
            lentils are washed multiple times in flowing water, vegetables are hand-picked and cleaned leaf by leaf,
            and jaggery, ghee, and spices are stored in sealed earthen and brass containers to keep them free from
            moisture and dust. Utensils are new or ritually purified before use, and the cooking area is kept free
            of footwear, leather, and anything considered impure, so that cleanliness and sanctity move together at
            every step.
          </p>
          <p className="leading-8">
            The environment itself shapes the food. Priests chant mantras as the earthen pots are stacked one over
            another on wood fire, cooking Mahaprasad entirely through steam and slow, even heat, without a single
            pot touching the flame directly. The rhythmic sound of chanting, the fragrance of turmeric leaves and
            camphor, and the glow of the temple lamps create a quiet, meditative atmosphere, so the food absorbs not
            just heat and spice, but devotion. This is why Mahaprasad and temple-style Pithas are believed to carry
            a taste that a home kitchen can rarely recreate.
          </p>
          <p className="leading-8">
            When we craft our Pithas and Panas in this same spirit, we hold onto these traditions, steaming in
            turmeric leaves, slow-baking in clay, sweetening only with jaggery, while keeping our kitchens as clean
            and disciplined as a temple hearth. What you receive is not just a sweet or a snack, but a small piece
            of Odisha's temple culture, prepared with the same care, cleanliness, and reverence it has carried for
            generations.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {posts.map((post) => (
          <article key={post.id} className="rounded-lg border border-temple/10 bg-white p-6 shadow-sm">
            <span className="rounded-full bg-haldi/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-temple">{post.category}</span>
            <h2 className="mt-4 font-display text-2xl font-bold text-temple">{post.title}</h2>
            <p className="mt-3 font-medium text-clay">{post.excerpt}</p>
            <p className="mt-4 leading-7 text-ink/70">{post.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
