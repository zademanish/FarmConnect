import { Link } from "react-router-dom";
import { Sprout, Users, ShieldCheck, Truck, Star, MessageSquare } from "lucide-react";

const FEATURES = [
  { icon: Users, title: "Direct Connection", text: "Farmers and buyers deal directly, with no middlemen taking a cut." },
  { icon: ShieldCheck, title: "Verified Listings", text: "Every product is reviewed and approved by an admin before going live." },
  { icon: Truck, title: "Managed Delivery", text: "Admin assigns delivery workers and both sides can track the order." },
  { icon: Star, title: "Ratings & Reviews", text: "Buyers rate delivered orders, building trust in genuine farmers." },
  { icon: MessageSquare, title: "Complaint Support", text: "Raise a complaint on any order and get an admin response." },
  { icon: Sprout, title: "Fair Pricing", text: "Farmers set their own price and keep the full value of their produce." },
];

const About = () => (
  <div>
    <section className="bg-gradient-to-br from-primary-700 to-primary-800 px-4 py-16 text-center text-white">
      <h1 className="text-3xl font-bold sm:text-4xl">About Farm Connect</h1>
      <p className="mx-auto mt-3 max-w-2xl text-primary-100">
        An agricultural marketplace built to give farmers a fair price for their harvest and give
        buyers genuinely fresh produce, straight from the source.
      </p>
    </section>

    <section className="mx-auto max-w-4xl px-4 py-14">
      <h2 className="text-2xl font-bold text-gray-900">The Problem We Solve</h2>
      <p className="mt-3 leading-relaxed text-gray-600">
        In traditional agricultural supply chains, produce passes through several intermediaries
        before reaching the buyer. Each layer adds cost, so farmers receive only a small share of
        the final price while buyers pay a premium for produce that is no longer fresh.
      </p>
      <p className="mt-3 leading-relaxed text-gray-600">
        Farm Connect removes those layers. A farmer lists their harvest with price, quantity and
        location. An admin verifies the listing. Buyers browse, compare and send a purchase request
        directly to the farmer. Once accepted, an order is created, a delivery worker is assigned,
        and both sides can track it until it is delivered and reviewed.
      </p>
    </section>

    <section className="bg-white px-4 py-14">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-2xl font-bold text-gray-900">What Farm Connect Offers</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <Icon size={21} />
              </span>
              <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-primary-700 px-4 py-14 text-center text-white">
      <h2 className="text-2xl font-bold">Join Farm Connect Today</h2>
      <p className="mx-auto mt-2 max-w-lg text-primary-100">
        Register as a farmer to sell your harvest, or as a buyer to source fresh produce directly.
      </p>
      <Link to="/register" className="btn mt-6 bg-white px-6 text-primary-700 hover:bg-primary-50">
        Get Started
      </Link>
    </section>
  </div>
);

export default About;
