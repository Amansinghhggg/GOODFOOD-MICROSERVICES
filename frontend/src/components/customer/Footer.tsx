const Footer = () => {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/30 mt-auto py-12 px-margin-mobile md:px-gutter">
      <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <span className="font-headline-md text-2xl font-black tracking-tighter text-primary block mb-4">GOODFOOD</span>
          <p className="text-on-surface-variant font-body-md max-w-sm">
            Delivering the best cuisines directly to your doorstep. Experience premium dining from the comfort of your home.
          </p>
        </div>
        <div>
          <h4 className="font-headline-md text-on-surface font-bold mb-4">Company</h4>
          <ul className="space-y-2 text-on-surface-variant font-body-md">
            <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Press</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-headline-md text-on-surface font-bold mb-4">Legal</h4>
          <ul className="space-y-2 text-on-surface-variant font-body-md">
            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-container-max mx-auto mt-12 pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-on-surface-variant font-body-md text-sm">
          © {new Date().getFullYear()} GOODFOOD Technologies Inc. All rights reserved.
        </p>
        <div className="flex gap-4">
          <a href="#" className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:text-primary hover:bg-primary/10 transition-colors">
            <span className="font-bold text-lg">X</span>
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:text-primary hover:bg-primary/10 transition-colors">
            <span className="font-bold text-lg">in</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
