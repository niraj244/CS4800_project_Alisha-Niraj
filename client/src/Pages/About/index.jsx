import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { IoArrowForward } from 'react-icons/io5';

const SIZE_GUIDE = [
  { size: 'XS', chest: '84–88', waist: '68–72', hip: '90–94' },
  { size: 'S',  chest: '88–92', waist: '72–76', hip: '94–98' },
  { size: 'M',  chest: '92–96', waist: '76–80', hip: '98–102' },
  { size: 'L',  chest: '96–100',waist: '80–84', hip: '102–106' },
  { size: 'XL', chest: '100–104',waist:'84–88', hip: '106–110' },
  { size: 'XXL',chest: '104–108',waist:'88–92', hip: '110–114' },
];

export default function About() {
  return (
    <>
      <SEO
        title="Our Story — VibeFit"
        description="VibeFit was born in Kathmandu. We make bold streetwear for the ones who lead, not follow."
        url="/about"
      />

      {/* Hero */}
      <section className="bg-primary text-white py-20 text-center">
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Our story</p>
        <h1 className="font-display font-bold text-5xl md:text-6xl leading-tight mb-6">
          Born in Kathmandu.<br />Worn everywhere.
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          VibeFit started with one idea: that your outfit should match your energy.
        </p>
      </section>

      {/* Story */}
      <section className="container py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-display font-bold text-3xl mb-6">Why VibeFit?</h2>
          <p className="text-text-muted leading-relaxed mb-4">
            We noticed that young people in Nepal had to settle for imported basics that didn't fit their style or their body. VibeFit was created to change that — clothes designed here, for people who live here.
          </p>
          <p className="text-text-muted leading-relaxed mb-6">
            Every piece is designed to be worn hard. We test everything on real bodies, in real Kathmandu conditions, before it ever reaches you.
          </p>
          <Link to="/shop" className="btn-accent inline-flex items-center gap-2">
            Shop the collection <IoArrowForward size={14} />
          </Link>
        </div>
        <div className="relative aspect-square max-w-md">
          <img
            src="/banner4.jpg"
            alt="VibeFit team in Kathmandu"
            loading="lazy"
            className="w-full h-full object-cover rounded-2xl"
          />
          <div className="absolute -bottom-4 -right-4 bg-accent text-white rounded-xl px-6 py-4 text-center shadow-lg">
            <p className="font-display font-bold text-2xl">2023</p>
            <p className="text-xs">Founded</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface-alt border-y border-border py-16">
        <div className="container text-center mb-10">
          <h2 className="font-display font-bold text-3xl">What we stand for</h2>
        </div>
        <div className="container grid sm:grid-cols-3 gap-6">
          {[
            { title: 'Bold design', body: 'We don\'t do subtle. Every piece is a statement.' },
            { title: 'Local first', body: 'Designed in Kathmandu. Proud of every stitch.' },
            { title: 'Real sizing', body: 'Clothes that fit real bodies, not mannequins.' },
          ].map(({ title, body }) => (
            <div key={title} className="bg-white rounded-xl p-6 border border-border text-center">
              <h3 className="font-display font-bold text-lg mb-2">{title}</h3>
              <p className="text-sm text-text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Size guide */}
      <section id="size-guide" className="container py-16">
        <h2 className="font-display font-bold text-3xl mb-8">Size Guide</h2>
        <p className="text-text-muted text-sm mb-6">All measurements in centimetres. When in between sizes, size up.</p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-alt">
              <tr>
                {['Size', 'Chest', 'Waist', 'Hip'].map((h) => (
                  <th key={h} className="py-3 px-4 text-left font-bold text-xs uppercase tracking-wider text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIZE_GUIDE.map((row, i) => (
                <tr key={row.size} className={i % 2 === 0 ? 'bg-white' : 'bg-surface-alt'}>
                  <td className="py-3 px-4 font-bold">{row.size}</td>
                  <td className="py-3 px-4 text-text-muted">{row.chest}</td>
                  <td className="py-3 px-4 text-text-muted">{row.waist}</td>
                  <td className="py-3 px-4 text-text-muted">{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
